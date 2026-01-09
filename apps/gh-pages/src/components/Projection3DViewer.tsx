import { signal, onMount, Show, computed, effect } from "@repo/einblatt";
import {
  type Model3D,
  type Vec3,
  type RendererConfig,
  DEFAULT_CUBE,
  DEFAULT_RENDERER_CONFIG,
  parseOBJ,
  createAnimationLoop,
} from "@repo/projection-3d";

export interface Projection3DViewerProps {
  /** Initial model to display (defaults to cube) */
  model?: Model3D;
  /** Aspect ratio width:height (defaults to 1) */
  aspectRatio?: number;
  /** Renderer configuration */
  rendererConfig?: RendererConfig;
  /** Rotation speed in radians per second (defaults to PI/2) */
  rotationSpeed?: number;
  /** Show controls UI (defaults to true) */
  showControls?: boolean;
}

/** Reusable Vec3 input component */
function Vec3Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Vec3;
  onChange: (v: Vec3) => void;
}) {
  const inputClass =
    "w-12 sm:w-14 px-1 py-1 text-xs text-gray-900 bg-white border border-gray-300 rounded text-center";

  return (
    <div class="flex items-center gap-1">
      <span class="text-gray-400 text-xs w-6">{label}</span>
      <input
        type="number"
        value={value.x.toString()}
        step="0.1"
        class={inputClass}
        onInput={(e) =>
          onChange({
            ...value,
            x: parseFloat((e.target as HTMLInputElement).value) || 0,
          })
        }
      />
      <input
        type="number"
        value={value.y.toString()}
        step="0.1"
        class={inputClass}
        onInput={(e) =>
          onChange({
            ...value,
            y: parseFloat((e.target as HTMLInputElement).value) || 0,
          })
        }
      />
      <input
        type="number"
        value={value.z.toString()}
        step="0.1"
        class={inputClass}
        onInput={(e) =>
          onChange({
            ...value,
            z: parseFloat((e.target as HTMLInputElement).value) || 0,
          })
        }
      />
    </div>
  );
}

export function Projection3DViewer({
  model: initialModel,
  aspectRatio = 1,
  rendererConfig = DEFAULT_RENDERER_CONFIG,
  rotationSpeed = (1 / 2) * Math.PI,
  showControls = true,
}: Projection3DViewerProps): JSX.Element {
  // State signals
  const model = signal<Model3D>(initialModel ?? DEFAULT_CUBE);
  const offsetZ = signal(2);
  const autoOffset = signal(false);
  const v1 = signal<Vec3>({ x: 0, y: 0, z: 0 });
  const v2 = signal<Vec3>({ x: 1, y: 1, z: 0.5 });
  const showAdvanced = signal(false);
  const chevron = computed(() => (showAdvanced.value ? "Less ▲" : "More ▼"));
  const zSliderClass = computed(() =>
    `flex items-center gap-2 flex-1 max-w-48 ${autoOffset.value ? "opacity-40 pointer-events-none" : ""}`
  );

  const container = (
    <div class="h-full">
      <div class="h-full flex items-center flex-col gap-2">
        <canvas
          id="projection-canvas"
          class="rounded border-2 border-gray-500 bg-white max-w-full max-h-full"
        />
        {showControls && (
          <div data-controls class="w-full max-w-md px-2 text-white text-xs">
            {/* Primary controls - always visible */}
            <div class="flex items-center justify-center gap-3 sm:gap-4">
              <label class={zSliderClass}>
                <span class="text-gray-400">Z</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.01"
                  class="flex-1"
                  value={offsetZ.value.toString()}
                  onInput={(e) => {
                    offsetZ.value = parseFloat(
                      (e.target as HTMLInputElement).value
                    );
                  }}
                />
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  class="w-3.5 h-3.5"
                  checked={autoOffset.value}
                  onChange={(e) => {
                    autoOffset.value = (e.target as HTMLInputElement).checked;
                  }}
                />
                <span>Auto Z+</span>
              </label>
              <button
                type="button"
                class="px-1.5 py-0.5 rounded hover:bg-gray-600 text-sm leading-none"
                onClick={() => (showAdvanced.value = !showAdvanced.value)}
                title={showAdvanced.value ? "Hide options" : "Show more options"}
              >
                {chevron}
              </button>
            </div>

            {/* Advanced controls - collapsible */}
            <Show when={showAdvanced}>
              <div class="mt-2 pt-2 border-t border-gray-600 space-y-2">
                <div class="flex flex-col items-center gap-1.5">
                  <Vec3Input
                    label="v1"
                    value={v1.value}
                    onChange={(v) => (v1.value = v)}
                  />
                  <Vec3Input
                    label="v2"
                    value={v2.value}
                    onChange={(v) => (v2.value = v)}
                  />
                  <label class="inline-flex items-center gap-2 px-3 py-1.5 mt-1 rounded bg-gray-600 hover:bg-gray-500 cursor-pointer">
                    <span>Load OBJ</span>
                    <input
                      type="file"
                      accept=".obj"
                      class="hidden"
                      onChange={async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const text = await file.text();
                          const objModel = parseOBJ(text);
                          if (
                            objModel.vertices.length > 0 &&
                            objModel.faces.length > 0
                          ) {
                            model.value = objModel;
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </Show>
          </div>
        )}
      </div>
    </div>
  ) as HTMLElement;

  onMount(() => {
    const canvas = container.querySelector(
      "#projection-canvas"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const parentWidth = container.clientWidth;
      const parentHeight = container.clientHeight;
      if (!parentWidth || !parentHeight) return;

      // Dynamically measure actual controls height
      const controlsEl = container.querySelector("[data-controls]");
      const controlsHeight = controlsEl
        ? (controlsEl as HTMLElement).offsetHeight
        : 0;
      const borderSize = 4;
      const gap = 8;
      const availableWidth = parentWidth - borderSize;
      const availableHeight = parentHeight - controlsHeight - gap - borderSize;

      // Calculate size maintaining aspect ratio within available space
      const scale = Math.min(
        availableWidth / aspectRatio,
        availableHeight
      );

      canvas.width = Math.floor(scale * aspectRatio);
      canvas.height = Math.floor(scale);
    };

    window.addEventListener("resize", resizeCanvas);

    // Wait for layout to complete before initial size calculation
    requestAnimationFrame(() => {
      resizeCanvas();
    });

    // Resize when advanced controls expand/collapse
    effect(() => {
      // Access the signal to create dependency
      showAdvanced.value;
      // Wait for DOM to update before measuring
      requestAnimationFrame(() => {
        resizeCanvas();
      });
    });

    const stopAnimation = createAnimationLoop({
      ctx,
      getModel: () => model.value,
      getRotationAxisV1: () => v1.value,
      getRotationAxisV2: () => v2.value,
      getOffsetZ: () => offsetZ.value,
      getAutoOffset: () => autoOffset.value,
      getCanvasWidth: () => canvas.width,
      getCanvasHeight: () => canvas.height,
      config: rendererConfig,
      rotationSpeed,
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      stopAnimation();
    };
  });

  return container;
}
