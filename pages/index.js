// /pages/index.js
// Renderiza o conteúdo de ./terminal/index.html e injeta os dados de internacionalização (i18n).

import fs from "fs";
import path from "path";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export async function getServerSideProps() {
  const possibleTerminalDirs = [
    path.join(process.cwd(), "terminal"),
    path.join(process.cwd(), "public", "terminal"),
  ];
  const pastaTerminal = possibleTerminalDirs.find((d) => fs.existsSync(d));
  const pastaLocales = path.join(process.cwd(), "locales");

  try {
    // Lê os arquivos do terminal
    const arquivoHtml = fs.readFileSync(path.join(pastaTerminal, "index.html"), "utf8");
    const arquivoCss = fs.readFileSync(path.join(pastaTerminal, "style.css"), "utf8");
    const arquivoJs = fs.readFileSync(path.join(pastaTerminal, "script.js"), "utf8");

    // Lê os arquivos de internacionalização
    const ptBr = JSON.parse(fs.readFileSync(path.join(pastaLocales, "pt-br.json"), "utf8"));
    const en = JSON.parse(fs.readFileSync(path.join(pastaLocales, "en.json"), "utf8"));
    const locales = { "pt-br": ptBr, en };

    // Insere CSS inline
    let htmlComInlines = arquivoHtml.replace(
      /<link[^>]*href=(["'])style\.css\1[^>]*>/i,
      `<style>\n${arquivoCss}\n</style>`
    );

    // Insere os dados de i18n e o script principal
    const scriptI18n = `<script>window.locales = ${JSON.stringify(locales)};</script>`;
    const scriptPrincipal = `<script>\n${arquivoJs}\n</script>`;

    htmlComInlines = htmlComInlines.replace(
      /<script[^>]*src=(["'])script\.js\1[^>]*>\s*<\/script>/i,
      `${scriptI18n}\n${scriptPrincipal}`
    );

    return {
      props: {
        srcDoc: htmlComInlines,
      },
    };
  } catch (erro) {
    return {
      props: {
        erro: String(erro),
      },
    };
  }
}

export default function Home({ srcDoc, erro }) {
  if (erro) {
    return (
      <>
        <main
          style={{
            padding: 20,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
          }}
        >
          <h2>
            Erro ao carregar os arquivos do diretório <code>terminal</code> ou <code>locales</code>
          </h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>{erro}</pre>
          <p>
            Verifique se as pastas <code>./terminal</code> ou <code>./public/terminal</code> e <code>./locales</code> existem e contêm os arquivos necessários.
          </p>
        </main>
        <footer>
          <SpeedInsights />
          <Analytics />
        </footer>
      </>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
      <iframe
        title="Portfólio Interativo"
        srcDoc={srcDoc}
        style={{ width: "100%", height: "100%", border: "0" }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
