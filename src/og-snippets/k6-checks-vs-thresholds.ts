// Checks record pass/fail. Only a threshold sets the exit code CI reads.
export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    // Gate on the built-in checks metric: failed checks now fail the run.
    checks: ['rate>0.9'],
    // Latency + error SLOs. Breach one and k6 exits 99.
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
