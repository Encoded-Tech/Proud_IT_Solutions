export const dynamic = "force-dynamic";
import BuildRequestsClient from "@/components/client/BuildTable";
import { fetchBuildRequests } from "@/lib/server/fetchers/fetchBuildRequest";


export default async function BuildRequestsPage() {
  // Server-side fetch
  const { success, data } = await fetchBuildRequests();

  if (!success) {
    return (
      <div className="p-10 text-red-500">
        Failed to load build requests
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Build Requests</h1>

      {/* Client component */}
      <BuildRequestsClient
        buildRequests={data} 
        
        itemsPerPage={1}
      />
    </div>
  );
}
