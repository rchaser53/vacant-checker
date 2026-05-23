import { useEffect, useState } from "react";
import { Command } from "@tauri-apps/plugin-shell";

export default function App() {
  const [ports, setPorts] = useState([]);

  async function refresh() {
    try {
      const output = await Command.create("node", [
        "src-tauri/bin/port-checker.js"
      ]).execute();

      setPorts(JSON.parse(output.stdout));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Port Monitor</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Port</th>
            <th>PID</th>
            <th>Command</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {ports.map((p, i) => (
            <tr key={`${p.pid}-${p.port}-${i}`}>
              <td>{p.port}</td>
              <td>{p.pid}</td>
              <td>{p.command}</td>
              <td>{p.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}