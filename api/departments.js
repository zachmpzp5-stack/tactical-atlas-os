const departments = Object.freeze({
  HOTEL: 'UNVERIFIED',
  ORBIT: 'UNVERIFIED',
  LEGION: 'UNVERIFIED',
  INSPECTOR: 'UNVERIFIED',
  ACADEMY: 'UNVERIFIED',
  COMMS: 'UNVERIFIED',
  ARCHIVES: process.env.DATABASE_URL ? 'ONLINE' : 'ADAPTER READY',
  PMO: 'UNVERIFIED',
  ATELIER: 'UNVERIFIED',
});

export default function handler(_request, response) {
  response.setHeader(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  );
  response.status(200).json({ network: 'TAAN', count: 9, verificationState: 'UNVERIFIED', departments });
}
