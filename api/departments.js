const departments = Object.freeze({
  HOTEL: 'READY',
  ORBIT: 'READY',
  LEGION: 'ACTIVE',
  INSPECTOR: 'ACTIVE',
  ACADEMY: 'READY',
  COMMS: 'READY',
  ARCHIVES: process.env.DATABASE_URL ? 'ONLINE' : 'ADAPTER READY',
  PMO: 'ACTIVE',
  ATELIER: 'READY',
});

export default function handler(_request, response) {
  response.setHeader(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  response.status(200).json({ network: 'TAAN', count: 9, departments });
}
