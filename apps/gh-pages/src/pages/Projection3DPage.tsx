import { Projection3DViewer } from "../components/Projection3DViewer";

export function Projection3DPage() {
  return (
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold mb-4">3D Projection Example</h1>

      <div class="space-y-4">
        <div class="bg-gray-700 shadow-lg rounded-lg p-3 h-[600px]">
          <Projection3DViewer />
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded p-3">
          <p class="text-sm text-gray-700">
            <strong>Note:</strong> This demonstrates a 3D to 2D projection using
            perspective projection and Rodrigues' rotation formula. You can
            adjust the rotation axis, Z offset, and even load custom OBJ models.
          </p>
        </div>
      </div>
    </div>
  );
}
