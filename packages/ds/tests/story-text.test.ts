import { describe, expect, it } from "vitest";
import { isProse, storyTexts, translateStory } from "../scripts/story-text";

const story = `
import meta from "./meta.json";
const FRUITS = [{ id: "apple", label: "Apple", name: "Green apple" }];
export const Default = {
  name: "when saving, should keep the draft",
  args: { label: "Save changes", variant: "outline" },
  parameters: { docs: { description: { story: "Not rendered" } } },
  render: (args) => (
    <Card title="Project alpha" className="flex gap-2">
      Hello {name},
      you have mail
      <Input placeholder={\`Search \${FRUITS.length} fruits\`} data-testid="Some id" />
    </Card>
  ),
  play: async () => {
    await expect(canvas.getByText("Only in the test")).toBeVisible();
  },
};
`;

describe("story text", () => {
  it("finds what renders, and not code or tests", () => {
    expect(storyTexts(story).sort()).toEqual(
      [
        "Apple",
        "Green apple",
        "Hello",
        "Project alpha",
        "Save changes",
        "Search",
        ", you have mail",
        "fruits",
      ].sort(),
    );
  });

  it("tells prose from identifiers", () => {
    expect(["Save", "save changes", "Ok!", "/mês", "1 usuário"].every(isProse)).toBe(true);
    expect(["outline", "/docs", "https://example.com", "a@b.com", "42"].some(isProse)).toBe(false);
  });

  it("keeps the spacing around the text it replaces", () => {
    const translated = translateStory(story, {
      Apple: "Maçã",
      Hello: "Olá",
      Search: "Buscar",
      fruits: "frutas",
    });
    expect(translated).toContain('label: "Maçã"');
    expect(translated).toContain('id: "apple"');
    expect(translated).toContain("      Olá {name}");
    expect(translated).toMatch(/`Buscar \$\{FRUITS\.length\} frutas`/);
    expect(translated).toContain('"Only in the test"');
  });

  it("leaves a text the dictionary doesn't know", () => {
    expect(translateStory(story, {})).toBe(story);
  });
});
