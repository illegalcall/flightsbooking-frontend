import FlightPageContent from "./flight-page";

export default async function FlightPage({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const { flightId } = await params;
  return <FlightPageContent flightId={flightId} />;
} 