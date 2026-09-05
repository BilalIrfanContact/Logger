const oneShot = process.argv.includes("--once");

console.log(JSON.stringify({ event: "worker_started", status: "placeholder" }));

if (!oneShot) {
  const keepAlive = setInterval(() => undefined, 2 ** 31 - 1);

  const shutdown = () => {
    clearInterval(keepAlive);
    console.log(JSON.stringify({ event: "worker_stopped", status: "placeholder" }));
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}
