
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch.js";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchRequests() {
      try {
        setLoading(true);
        setError("");

        const result = await apiFetch(
          "http://localhost:5000/api/blood-requests/me"
        );

        // Backend response: result.data.requests
        const list = result?.data?.requests ?? result?.requests ?? [];

        if (isMounted) {
          setRequests(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load blood requests.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">
          My Requests
        </h1>

        <p className="mb-6 text-slate-500">
          View the blood requests you have submitted.
        </p>

        {loading ? (
          <div className="rounded-xl bg-white p-6 text-slate-600">
            Loading your requests...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-6">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-700">
              No blood requests found
            </h2>
            <p className="mt-2 text-slate-500">
              Your submitted requests will appear here.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">
              Total requests: <strong>{requests.length}</strong>
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {requests.map((request) => (
                <div
                  key={request._id || request.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Request ID: {request.code || request.id || request._id}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-red-600">
                        {request.bloodGroup || "Blood group not specified"}
                      </h2>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                      {request.status || "Pending"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <strong>Patient:</strong>{" "}
                      {request.patientName || "Not specified"}
                    </p>

                    <p>
                      <strong>Hospital:</strong>{" "}
                      {request.hospitalName || "Not specified"}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {request.hospitalLocation || "Not specified"}
                    </p>

                    <p>
                      <strong>Units:</strong>{" "}
                      {request.units ?? "Not specified"}
                    </p>

                    <p>
                      <strong>Urgency:</strong>{" "}
                      {request.urgency || "Normal"}
                    </p>

                    <p>
                      <strong>Contact:</strong>{" "}
                      {request.contact || "Not specified"}
                    </p>

                    {request.dateNeeded && (
                      <p>
                        <strong>Date needed:</strong>{" "}
                        {new Date(request.dateNeeded).toLocaleDateString()}
                      </p>
                    )}

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : "Not available"}
                    </p>

                    {request.details && (
                      <p>
                        <strong>Details:</strong> {request.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
