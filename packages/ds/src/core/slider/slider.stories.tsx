import type { Meta, StoryObj } from "@storybook/react-vite";
import { SparklesIcon } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Field, FieldLabel } from "@/core/field/field";
import meta from "./meta.json";
import {
  Slider,
  SliderControl,
  SliderDescription,
  SliderFill,
  SliderLabel,
  SliderMarks,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "./slider";

const componentMeta = {
  title: "ds/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: meta.description } },
  },
  argTypes: {
    minValue: { control: "number" },
    maxValue: { control: "number" },
    step: { control: "number" },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    isDisabled: { control: "boolean" },
  },
  args: {
    defaultValue: 33,
    "aria-label": "Volume",
  },
  render: (args) => (
    <div className="w-64">
      <Slider {...args} />
    </div>
  ),
} satisfies Meta<typeof Slider>;

export default componentMeta;
type Story = StoryObj<typeof componentMeta>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: "A single-thumb slider with one draggable value." } },
  },
};

// A multi-value array renders one thumb per value, not a separate "range" prop.
export const Range: Story = {
  args: { defaultValue: [20, 80] },
  parameters: {
    docs: {
      description: { story: "A defaultValue array renders two thumbs for a min/max range." },
    },
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical", "aria-label": "Volume" },
  parameters: {
    docs: {
      description: {
        story: 'orientation="vertical" for a top-to-bottom slider; marks sit beside the track.',
      },
    },
  },
  render: (args) => (
    <div className="h-40">
      <Slider {...args}>
        <SliderControl>
          <SliderTrack>
            <SliderFill />
          </SliderTrack>
          <SliderThumb />
        </SliderControl>
        <SliderMarks marks={[0, 50, 100]} />
      </Slider>
    </div>
  ),
};

export const Disabled: Story = {
  args: { isDisabled: true },
  parameters: {
    docs: { description: { story: "isDisabled prevents dragging and dims the track/thumb." } },
  },
};

/**
 * The parts: `SliderLabel` and `SliderValue` (formatted by its `children`)
 * above, `SliderMarks` under the track. Clicking a mark moves the thumb there.
 */
export const WithMarks: Story = {
  args: {
    minValue: 0,
    maxValue: 500,
    step: 50,
    defaultValue: 100,
    onChangeEnd: fn(),
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args}>
        <div className="flex items-center gap-3">
          <SliderLabel>Pedidos por mês</SliderLabel>
          <SliderValue>{(value) => `${value} pedidos`}</SliderValue>
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderFill />
          </SliderTrack>
          <SliderThumb />
        </SliderControl>
        <SliderMarks marks={[0, 100, 200, 300, 400, 500]} />
      </Slider>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Pedidos por mês" });
    await expect(canvas.getByText("100 pedidos")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "300" }));
    await expect(slider).toHaveValue("300");
    await expect(canvas.getByText("300 pedidos")).toBeInTheDocument();
    await expect(args.onChangeEnd).toHaveBeenLastCalledWith(300);

    // Focus lands on the thumb, so the arrow keys continue from the mark.
    await expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByText("350 pedidos")).toBeInTheDocument();
  },
};

/** A range with currency formatting and custom mark labels; a mark moves the nearest thumb. */
export const RangeWithMarks: Story = {
  args: {
    minValue: 0,
    maxValue: 100_000,
    step: 5_000,
    defaultValue: [20_000, 60_000],
    formatOptions: { style: "currency", currency: "BRL", maximumFractionDigits: 0 },
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args}>
        <div className="flex items-center gap-3">
          <SliderLabel>Receita mensal</SliderLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderFill />
          </SliderTrack>
          <SliderThumb />
        </SliderControl>
        <SliderMarks
          marks={[
            { value: 0, label: "R$ 0" },
            { value: 50_000, label: "R$ 50 mil" },
            { value: 100_000, label: "R$ 100 mil" },
          ]}
        />
      </Slider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "R$ 100 mil" }));
    const [min, max] = canvas.getAllByRole("slider");
    await expect(min).toHaveValue("20000");
    await expect(max).toHaveValue("100000");
  },
};

/**
 * `limit` caps the value below `maxValue`: the scale keeps its marks, the
 * track above the limit is drawn as unavailable and its marks are disabled.
 * `SliderDescription` says why, and screen readers hear it with the value.
 */
export const Limit: Story = {
  args: {
    minValue: 0,
    maxValue: 60,
    step: 10,
    defaultValue: 10,
    limit: 20,
    onChange: fn(),
    onChangeEnd: fn(),
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args}>
        <div className="flex items-center gap-3">
          <SliderLabel>Pedidos adicionais</SliderLabel>
          <SliderValue>{(value) => `${value} pedidos`}</SliderValue>
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderFill />
          </SliderTrack>
          <SliderThumb />
        </SliderControl>
        <SliderMarks marks={[0, 10, 20, 30, 40, 50, 60]} />
        <SliderDescription>Só 20 disponíveis neste ciclo.</SliderDescription>
      </Slider>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Pedidos adicionais" });
    await expect(slider).toHaveAccessibleDescription("Só 20 disponíveis neste ciclo.");
    await expect(canvas.getByRole("button", { name: "30" })).toBeDisabled();

    // The keyboard stops at the limit, not at maxValue.
    await userEvent.click(canvas.getByRole("button", { name: "20" }));
    await expect(slider).toHaveValue("20");
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveValue("20");
    await expect(canvas.getByText("20 pedidos")).toBeInTheDocument();
    await expect(args.onChangeEnd).toHaveBeenLastCalledWith(20);
    await expect(args.onChange).not.toHaveBeenCalledWith(30);

    await userEvent.keyboard("{Home}");
    await expect(slider).toHaveValue("0");
  },
};

/**
 * Every part takes a `className`, and `SliderThumb` takes `children`: here a
 * gradient fill, a thicker track and a bigger thumb with an icon standing in
 * for a logo. Marks, limit and the keyboard work as usual.
 */
export const CustomThumb: Story = {
  args: {
    minValue: 0,
    maxValue: 60,
    step: 10,
    defaultValue: 20,
    limit: 40,
  },
  render: (args) => (
    <div className="w-80">
      <Slider {...args}>
        <div className="flex items-center gap-3">
          <SliderLabel>Notas adicionais</SliderLabel>
          <SliderValue>{(value) => `${value} notas`}</SliderValue>
        </div>
        <SliderControl>
          <SliderTrack className="bg-primary/20 data-horizontal:h-3">
            <SliderFill className="bg-linear-to-r from-secondary via-secondary to-primary" />
          </SliderTrack>
          <SliderThumb className="size-8 border-primary/50 bg-primary shadow">
            <SparklesIcon aria-hidden="true" className="size-4 text-primary-foreground" />
          </SliderThumb>
        </SliderControl>
        <SliderMarks marks={[0, 10, 20, 30, 40, 50, 60]} />
        <SliderDescription>Só 40 disponíveis neste ciclo.</SliderDescription>
      </Slider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Notas adicionais" });
    const thumb = canvasElement.querySelector("[data-slot=slider-thumb]");
    await expect(thumb?.querySelector("svg")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "30" }));
    await expect(slider).toHaveValue("30");
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveValue("40");
    await expect(canvas.getByRole("button", { name: "50" })).toBeDisabled();
  },
};

/** Inside a `Field`, a `FieldLabel` names it like any other form control. */
export const InField: Story = {
  args: { defaultValue: 40 },
  render: (args) => (
    <div className="w-80">
      <Field>
        <Slider {...args}>
          <FieldLabel>Brilho</FieldLabel>
          <SliderControl>
            <SliderTrack>
              <SliderFill />
            </SliderTrack>
            <SliderThumb />
          </SliderControl>
          <SliderDescription>Ajuste o brilho da tela.</SliderDescription>
        </Slider>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Brilho" });
    await expect(slider).toHaveValue("40");
    await expect(slider).toHaveAccessibleDescription("Ajuste o brilho da tela.");
  },
};

/** A real mouse's pointer event on the track, as react-aria reads it. */
function pointerOnTrack(track: HTMLElement, type: string, clientX: number) {
  const box = track.getBoundingClientRect();
  track.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX,
      clientY: box.top + box.height / 2,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: type === "pointermove" ? -1 : 0,
      buttons: type === "pointerup" ? 0 : 1,
    }),
  );
}

function thumbCenter(canvasElement: HTMLElement) {
  const box = (
    canvasElement.querySelector("[data-slot=slider-thumb]") as HTMLElement
  ).getBoundingClientRect();
  return box.left + box.width / 2;
}

/** A press on the track glides the thumb there; over fine steps a drag then follows the pointer at once. */
export const ShouldGlideOnJumpAndFollowDrag: Story = {
  tags: ["!autodocs"],
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector("[data-slot=slider-track]") as HTMLElement;
    const control = canvasElement.querySelector("[data-slot=slider-control]") as HTMLElement;
    const box = track.getBoundingClientRect();

    const target = box.left + box.width * 0.9;
    pointerOnTrack(track, "pointerdown", target);
    await new Promise(requestAnimationFrame);
    // still on its way
    await expect(Math.abs(thumbCenter(canvasElement) - target)).toBeGreaterThan(2);
    await waitFor(() => expect(thumbCenter(canvasElement)).toBeCloseTo(target, 0));

    for (const fraction of [0.8, 0.65, 0.5]) {
      const clientX = box.left + box.width * fraction;
      pointerOnTrack(track, "pointermove", clientX);
      await waitFor(() => expect(control).toHaveAttribute("data-following"));
      await new Promise(requestAnimationFrame);
      await expect(thumbCenter(canvasElement)).toBeCloseTo(clientX, 0);
    }

    pointerOnTrack(track, "pointerup", box.left + box.width * 0.5);
    await waitFor(() => expect(control).not.toHaveAttribute("data-following"));
  },
};

/** Over steps you can see, a drag glides from step to step instead of snapping. */
export const ShouldGlideBetweenStepsWhileDragging: Story = {
  tags: ["!autodocs"],
  args: { minValue: 0, maxValue: 500, step: 50, defaultValue: 100 },
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector("[data-slot=slider-track]") as HTMLElement;
    const control = canvasElement.querySelector("[data-slot=slider-control]") as HTMLElement;
    const box = track.getBoundingClientRect();
    const at = (value: number) => box.left + (box.width * value) / 500;

    pointerOnTrack(track, "pointerdown", at(100));
    await waitFor(() => expect(thumbCenter(canvasElement)).toBeCloseTo(at(100), 0));
    // past the middle of the next step: the thumb snaps to 150, gliding there
    pointerOnTrack(track, "pointermove", at(130));
    await new Promise(requestAnimationFrame);
    await expect(control).not.toHaveAttribute("data-following");
    await expect(thumbCenter(canvasElement)).toBeLessThan(at(150) - 2);
    await waitFor(() => expect(thumbCenter(canvasElement)).toBeCloseTo(at(150), 0));
    await expect(canvasElement.querySelector("input[type=range]")).toHaveValue("150");
    pointerOnTrack(track, "pointerup", at(130));
  },
};
