export const roleExtractionPrompt = (jobDescription) =>
  `Read this job description. Return STRICT JSON only: {"title":"","seniority":"","responsibilities":[""],"requirements":[{"id":"r1","text":"","kind":"technical|behavioural|domain","priority":"must|nice"}]}. Extract only explicit information. Never invent a requirement. Use stable sequential IDs.\n\nJOB DESCRIPTION:\n${jobDescription}`;

export const companyBriefPrompt = (companyText, urls) =>
  `Using only the supplied company-site text, return STRICT JSON only: {"summary":"","what_they_do":"","sources":[]}. If the text is insufficient, explicitly say so rather than guessing. sources must be selected only from this URL list: ${JSON.stringify(urls)}.\n\nCOMPANY TEXT:\n${companyText.slice(0, 15000)}`;

export const questionsPrompt = (role, brief, requirements) =>
  `Generate interview questions using only the requirements below. Return STRICT JSON only as an array of objects: [{"id":"q1","requirement_ids":["r1"],"category":"technical|behavioural|system-design|company-fit","prompt":"","answer_outline":"","difficulty":1}]. Every question must reference one or more provided requirement IDs. difficulty must be 1, 2, or 3. Do not invent technologies or requirements.\n\nROLE: ${role.title || "Not specified"}\nCOMPANY BRIEF: ${brief.summary || "Not available"}\nREQUIREMENTS: ${JSON.stringify(requirements)}`;

export const flashcardsPrompt = (role, requirements, questions) =>
  `Create concise revision flashcards only from these interview requirements and questions. Return STRICT JSON only: [{"id":"f1","requirement_ids":["r1"],"front":"","back":""}]. Every card must reference a provided requirement ID. One concept per card. Each back must be under 80 words and contain no markdown.\n\nROLE: ${role.title || "Not specified"}\nREQUIREMENTS: ${JSON.stringify(requirements)}\nQUESTIONS: ${JSON.stringify(questions)}`;
