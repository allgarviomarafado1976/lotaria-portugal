import axios from "axios";
import * as cheerio from "cheerio";
import { getDb } from "./db";
import { euroMillionDraws, totoDraws } from "../drizzle/schema";

/**
 * Scraper para importar dados de sorteios do site oficial dos Jogos Santa Casa
 * Nota: Este é um exemplo educacional. Para produção, usar API oficial se disponível.
 */

interface EuroMillionDraw {
  date: Date;
  numbers: number[];
  stars: number[];
}

interface TotalotoDraw {
  date: Date;
  numbers: number[];
  luckyNumber: number;
}

/**
 * Scrape EuroMilhões draws from official website
 * Retorna array de sorteios com data, números e estrelas
 */
export async function scrapeEuroMillionDraws(): Promise<EuroMillionDraw[]> {
  try {
    const url = "https://www.jogossantacasa.pt/web/SCCartazResult/euromilhoes";
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const draws: EuroMillionDraw[] = [];

    // Selector para linhas de sorteios (ajustar conforme estrutura HTML)
    $("tr[data-draw-id]").each((index: number, element: any) => {
      try {
        const dateStr = $(element).find("td:nth-child(1)").text().trim();
        const numbersStr = $(element).find("td:nth-child(2)").text().trim();
        const starsStr = $(element).find("td:nth-child(3)").text().trim();

        if (dateStr && numbersStr && starsStr) {
          const date = new Date(dateStr);
          const numbers = numbersStr
            .split(/\s+/)
            .map((n: string) => parseInt(n))
            .filter((n: number) => !isNaN(n) && n > 0 && n <= 50);
          const stars = starsStr
            .split(/\s+/)
            .map((n: string) => parseInt(n))
            .filter((n: number) => !isNaN(n) && n > 0 && n <= 12);

          if (numbers.length === 5 && stars.length === 2) {
            draws.push({ date, numbers, stars });
          }
        }
      } catch (error) {
        console.error("Erro ao fazer parse de linha EuroMilhões:", error);
      }
    });

    return draws;
  } catch (error) {
    console.error("Erro ao fazer scrape de EuroMilhões:", error);
    return [];
  }
}

/**
 * Scrape Totoloto draws from official website
 */
export async function scrapeTotolotoDraws(): Promise<TotalotoDraw[]> {
  try {
    const url = "https://www.jogossantacasa.pt/web/SCCartazResult/totolotoNew";
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const draws: TotalotoDraw[] = [];

    // Selector para linhas de sorteios (ajustar conforme estrutura HTML)
    $("tr[data-draw-id]").each((index: number, element: any) => {
      try {
        const dateStr = $(element).find("td:nth-child(1)").text().trim();
        const numbersStr = $(element).find("td:nth-child(2)").text().trim();
        const luckyStr = $(element).find("td:nth-child(3)").text().trim();

        if (dateStr && numbersStr && luckyStr) {
          const date = new Date(dateStr);
          const numbers = numbersStr
            .split(/\s+/)
            .map((n: string) => parseInt(n))
            .filter((n: number) => !isNaN(n) && n > 0 && n <= 49);
          const luckyNumber = parseInt(luckyStr);

          if (numbers.length === 6 && !isNaN(luckyNumber) && luckyNumber > 0 && luckyNumber <= 9) {
            draws.push({ date, numbers, luckyNumber });
          }
        }
      } catch (error) {
        console.error("Erro ao fazer parse de linha Totoloto:", error);
      }
    });

    return draws;
  } catch (error) {
    console.error("Erro ao fazer scrape de Totoloto:", error);
    return [];
  }
}

/**
 * Importa sorteios para a base de dados
 */
export async function importDrawsToDatabase() {
  const db = await getDb();
  if (!db) {
    console.error("Database não disponível");
    return { success: false, message: "Database não disponível" };
  }

  try {
    // Importar EuroMilhões
    console.log("Iniciando importação de EuroMilhões...");
    const euroDraws = await scrapeEuroMillionDraws();
    let euroInserted = 0;

    for (const draw of euroDraws) {
      try {
        const dateStr = draw.date.toISOString().split('T')[0];
        await db.insert(euroMillionDraws).values({
          date: dateStr,
          number1: draw.numbers[0],
          number2: draw.numbers[1],
          number3: draw.numbers[2],
          number4: draw.numbers[3],
          number5: draw.numbers[4],
          star1: draw.stars[0],
          star2: draw.stars[1],
        });
        euroInserted++;
      } catch (error) {
        // Ignorar duplicatas
        if ((error as any).code !== "ER_DUP_ENTRY") {
          console.error("Erro ao inserir sorteio EuroMilhões:", error);
        }
      }
    }

    // Importar Totoloto
    console.log("Iniciando importação de Totoloto...");
    const totoDrawsList = await scrapeTotolotoDraws();
    let totoInserted = 0;

    for (const draw of totoDrawsList) {
      try {
        const dateStr = draw.date.toISOString().split('T')[0];
        await db.insert(totoDraws).values({
          date: dateStr,
          number1: draw.numbers[0],
          number2: draw.numbers[1],
          number3: draw.numbers[2],
          number4: draw.numbers[3],
          number5: draw.numbers[4],
          number6: draw.numbers[5],
          luckyNumber: draw.luckyNumber,
        });
        totoInserted++;
      } catch (error) {
        // Ignorar duplicatas
        if ((error as any).code !== "ER_DUP_ENTRY") {
          console.error("Erro ao inserir sorteio Totoloto:", error);
        }
      }
    }

    const message = `Importação concluída: ${euroInserted} EuroMilhões, ${totoInserted} Totoloto`;
    console.log(message);
    return { success: true, message, euroInserted, totoInserted };
  } catch (error) {
    console.error("Erro durante importação:", error);
    return { success: false, message: "Erro durante importação", error };
  }
}

/**
 * Função para ser chamada pelo cron job
 */
export async function runDailyImport() {
  console.log(`[${new Date().toISOString()}] Iniciando importação diária de sorteios...`);
  const result = await importDrawsToDatabase();
  console.log(`[${new Date().toISOString()}] Resultado:`, result);
  return result;
}
