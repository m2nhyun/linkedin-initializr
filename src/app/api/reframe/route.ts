import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Tone = "linkedin" | "resume" | "meme";

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "titleKo",
    "titleEn",
    "summary",
    "bullets",
    "skills",
    "markdown",
    "plainText",
    "mismatchNote",
    "realityBlock",
    "polishedBlock",
  ],
  properties: {
    headline: { type: "string" },
    titleKo: { type: "string" },
    titleEn: { type: "string" },
    summary: { type: "string" },
    bullets: {
      type: "array",
      items: { type: "string" },
    },
    skills: {
      type: "array",
      items: { type: "string" },
    },
    markdown: { type: "string" },
    plainText: { type: "string" },
    mismatchNote: { type: "string" },
    realityBlock: {
      type: "array",
      items: { type: "string" },
    },
    polishedBlock: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

function buildInstructions(tone: Tone) {
  const base = `
You are the writing engine for "딸깍톤 (Ddalggakton)".

Core mission:
- Reframe plain, self-deprecating, or underwhelming user inputs into stronger professional language for job-seeking and career positioning.
- Preserve truth. Do not invent employers, metrics, leadership, ownership, promotions, or business results that the user did not imply.
- If the input does not directly match the target role, reinterpret it as transferable strengths instead of lying.
- The final result must feel polished enough to paste into LinkedIn, a resume draft, or a profile note, depending on tone.

Output requirements:
- Always return Korean-first output, but English professional terms may be mixed in when appropriate for tone.
- Produce one polished Korean title and one English subtitle.
- Create one headline.
- Create one summary paragraph.
- Create 3 to 5 bullets.
- Create 4 to 6 skills that are directly relevant to the target role.
- Provide a markdown version and a plain text version for copy-paste.
- If user inputs are mismatched with the target role, explain that briefly in "mismatchNote".
- For meme tone only, include "realityBlock" and "polishedBlock" arrays with up to 3 items each.
- For non-meme tones, return empty arrays for "realityBlock" and "polishedBlock".

Hard constraints:
- No fake numbers or fabricated achievements.
- No direct claims of leading, architecting, owning, or improving KPIs unless clearly supported by the input.
- Do not produce childish jokes unless tone is meme.
- Do not make LinkedIn or resume outputs read like satire.
`.trim();

  if (tone === "linkedin") {
    return `${base}

LinkedIn tone rules:
- This must feel like something a user can paste directly into LinkedIn without embarrassment.
- The result must be professional, confident, and serious. Do not be comedic.
- Follow LinkedIn conventions: strong positioning, concise About-style summary, action-oriented bullets, skills-oriented phrasing.
- The markdown and plain text should clearly resemble LinkedIn Headline / About / Experience / Skills sections.
- Headline should look like a real LinkedIn headline, for example:
  "Frontend Developer | React · UI Engineering · Component Architecture"
- Summary should read like an About section: 3 to 4 sentences, confident but grounded, future-oriented closing.
- Bullets should read like Experience highlights. Start each bullet with a strong action verb in English or a sharp Korean verb phrase.
- Include a real skills list. Do not leave skills generic.
- Use natural English professional terms where appropriate, but keep the overall text readable to a Korean job seeker.
- Avoid meme phrasing, punchlines, exaggerated comedy, ironic headlines, or novelty titles in the headline.
- "titleKo" and "titleEn" may still be polished and elevated, but must remain credible.
`.trim();
  }

  if (tone === "resume") {
    return `${base}

Resume tone rules:
- This must feel like polished Korean resume or self-introduction content.
- Use formal Korean writing style. Prefer "~하였습니다", "~을 통해", "~을 수행하였습니다" level formality.
- The result must be credible, structured, and free from jokes.
- Headline should look like a believable resume role label, not a marketing slogan.
- Summary should read like a concise self-introduction paragraph.
- Bullets should read like major responsibilities or experience highlights written for a Korean resume.
- Include a concise, credible skills list aligned with the described work.
- Focus on role context, actions, learning, and contribution. Use inferred professional framing, but do not overclaim outcomes.
- Avoid emoji, internet slang, irony, and flashy English buzzwords.
`.trim();
  }

  return `${base}

Meme tone rules:
- This tone is the only one allowed to be playful, ironic, and slightly over-the-top.
- The output should still be coherent and rooted in the user's input.
- "백수 -> 홈프로텍터" style reframing is welcome here.
- The humor should come from exaggerated professional reframing, not random nonsense.
- The output may be witty, but still needs persuasive structure.
- For meme tone, use "realityBlock" and "polishedBlock" meaningfully.
`.trim();
}

function buildInput(payload: {
  role: string;
  targetRole: string;
  experience: string;
  stack: string;
  tone: Tone;
  rawInput: string;
}) {
  return `
Current role/state: ${payload.role}
Target role: ${payload.targetRole}
Experience summary: ${payload.experience}
Tech stack: ${payload.stack}
Requested tone: ${payload.tone}

User raw input:
${payload.rawInput}

Output notes:
- Make the wording stronger and more presentable.
- Stay grounded in the user's actual input.
- If the user writes things unrelated to the target role, reinterpret them as adjacent strengths or cultural/behavioral signals.
- For linkedin tone, optimize for something that can be pasted directly into LinkedIn Headline/About/Experience.
- For resume tone, optimize for something that can be pasted into a Korean resume or self-introduction section.
- For meme tone, keep the entertainment value high but the logic internally consistent.
`.trim();
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되지 않았습니다. 환경 변수 설정 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = (await request.json()) as {
      role?: string;
      targetRole?: string;
      experience?: string;
      stack?: string;
      tone?: Tone;
      rawInput?: string;
    };

    if (!body.role || !body.targetRole || !body.experience || !body.stack || !body.tone || !body.rawInput) {
      return NextResponse.json({ error: "필수 입력값이 부족합니다." }, { status: 400 });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      instructions: buildInstructions(body.tone),
      input: buildInput({
        role: body.role,
        targetRole: body.targetRole,
        experience: body.experience,
        stack: body.stack,
        tone: body.tone,
        rawInput: body.rawInput,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "ddalggakton_result",
          strict: true,
          schema,
        },
      },
    });

    const result = JSON.parse(response.output_text);

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI 요청 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
