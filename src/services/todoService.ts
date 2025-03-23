import * as todoRepo from "../repositories/todoRepository";
import { Todo } from "../repositories/todoRepository";

// 日本の2025年祝日データ（ハードコーディング）
export const HOLIDAYS_2025 = `
2025/01/01 (Wednesday)  – New Year's Day (元日)
2025/01/13 (Monday)     – Coming of Age Day (成人の日) [2nd Monday of January]
2025/02/11 (Tuesday)    – National Foundation Day (建国記念の日)
2025/03/20 (Thursday)   – Vernal Equinox Day (春分の日) [概算]
2025/04/29 (Tuesday)    – Showa Day (昭和の日)
2025/05/03 (Saturday)   – Constitution Memorial Day (憲法記念日)
2025/05/04 (Sunday)     – Greenery Day (みどりの日)
2025/05/05 (Monday)     – Children's Day (こどもの日)
2025/07/21 (Monday)     – Marine Day (海の日) [3rd Monday of July]
2025/08/11 (Monday)     – Mountain Day (山の日)
2025/09/15 (Monday)     – Respect for the Aged Day (敬老の日) [3rd Monday of September]
2025/09/23 (Tuesday)    – Autumnal Equinox Day (秋分の日) [概算]
2025/10/13 (Monday)     – Health and Sports Day (体育の日/スポーツの日) [2nd Monday of October]
2025/11/03 (Monday)     – Culture Day (文化の日)
2025/11/23 (Sunday)     – Labour Thanksgiving Day (勤労感謝の日)
`;

// Prompt for formatting TODOs (fixed text)
const TODO_FORMAT_PROMPT = `Below is a TODO list written in various formats. Please convert it into a clean, unified Markdown format according to the rules below. Additionally, if the user instructs "I have finished a task, update it," mark the corresponding task as completed. Follow these rules:
1. **Task Status:**  
   - Each task should be a list item with a checkbox.  
   - Use \`[ ]\` for incomplete tasks and \`[x]\` for completed tasks.  
   - If the user instructs that a task is finished, update the task status to \`[x]\`. If a completion date and time are missing, append the current date and time (e.g., \`*Completed on:* yyyy/mm/dd (HH:MM)\`) or mark as "TBD" as needed.
2. **Task Name & Emojis:**  
   - Make the task name **bold**.  
   - Prepend the task name with an appropriate emoji that matches the task's nature (for example, use ✏️ or 📓 for blog posts, 🍰 or 🍳 for cooking, 🏃 or 🏋️ for exercise, etc.).  
   - Use different emojis based on the task content.
3. **Date and Time Information:**  
   - If a due date is provided, output it as \`*Due:* yyyy/mm/dd (HH:MM)\`.  
   - If a completed date is provided, output it as \`*Completed on:* yyyy/mm/dd (HH:MM)\`.  
   - If a date is provided but the time is missing, add \`(TBD)\` after the date.  
   - If no date information is available, output \`*Due:* TBD\`.
4. **Priority:**  
   - If a task has a specified priority, output it as \`*Priority:* High\`, \`*Priority:* Medium\`, or \`*Priority:* Low\`.  
   - If no priority is mentioned, output \`*Priority:* Normal\`.
5. **Notes:**  
   - If there are any additional notes or details, include them under \`*Notes:*\`.
**Example Output:**
\`\`\`markdown
- [ ] ✏️ **Write Blog Post**  
  *Due:* 2025/05/01 (14:30)  
  *Priority:* High  
  *Notes:* Research topic, draft outline, review with team
- [x] 🏃 **Morning Workout**  
  *Completed on:* 2025/04/30 (07:00)  
  *Priority:* Normal
- [ ] 🍳 **Bake Cupcakes**  
  *Due:* TBD  
  *Priority:* Low  
  *Notes:* Buy ingredients, follow recipe, decorate with sprinkles
\`\`\`
`;

/**
 * Update latest TODO
 */
export function updateTodo(content: string): number {
  return todoRepo.updateLatestTodo({ content });
}

/**
 * Get the latest TODO with format prompt
 */
export function getLatestTodoWithPrompt(): {
  todo: Todo | null;
  prompt: string;
} {
  const todo = todoRepo.getLatestTodo();
  return {
    todo,
    prompt: TODO_FORMAT_PROMPT,
  };
}

/**
 * Search TODOs by text and return with prompt
 */
export function searchTodoWithPrompt(searchText: string): {
  todos: Todo[];
  prompt: string;
} {
  const todos = todoRepo.searchTodosByText(searchText);
  return {
    todos,
    prompt: TODO_FORMAT_PROMPT,
  };
}
