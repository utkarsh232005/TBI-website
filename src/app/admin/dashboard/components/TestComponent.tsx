export function TestComponent() {
  return (
    <div className="p-4 bg-red-500 text-white rounded-lg m-4">
      <h2 className="text-xl font-bold">TEST COMPONENT - If you see this, changes are working!</h2>
      <p>This is a test to verify that file changes are being applied.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
