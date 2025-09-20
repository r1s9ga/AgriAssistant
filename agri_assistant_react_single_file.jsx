import React, { useEffect, useState, useRef } from "react";

// Single-file React app (App.jsx)
// Tailwind CSS assumed to be available in the project (PostCSS / CRA / Vite + tailwind setup)
// This file is a production-ready starter that covers the features you requested,
// with clear TODOs where API keys and backend hooks are needed.

export default function App() {
  // Farmer profile + farm context (persisted)
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agri_profile")) || {
        name: "",
        location: "",
        landSize: "",
        soilType: "Loam",
        irrigation: "Drip",
        crops: ["Rice"],
      };
    } catch (e) {
      return { name: "", location: "", landSize: "", soilType: "Loam", irrigation: "Drip", crops: ["Rice"] };
    }
  });

  useEffect(() => {
    localStorage.setItem("agri_profile", JSON.stringify(profile));
  }, [profile]);

  // Weather
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Pest notifications (mocked / can be replaced with real feed)
  const [pestAlerts, setPestAlerts] = useState([
    { id: 1, title: "Brown Plant Hopper - Nearby", severity: "high", date: "2025-09-18" },
    { id: 2, title: "Stem borer reports increasing", severity: "medium", date: "2025-09-15" },
  ]);

  // Crop calendar (example)
  const [cropCalendar, setCropCalendar] = useState([]);

  // Market prices (mock)
  const [marketPrices, setMarketPrices] = useState([
    { crop: "Rice", mandi: "Thrissur", price: 2100 },
    { crop: "Banana", mandi: "Kozhikode", price: 1200 },
  ]);

  // Image diagnosis (preview only - replace with ML API)
  const [imagePreview, setImagePreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);

  // Voice (Web Speech API)
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantReply, setAssistantReply] = useState("");

  useEffect(() => {
    // prepare crop calendar based on profile.crops - naive example
    const calendar = profile.crops.map((c, idx) => ({
      crop: c,
      sow: "2025-06-01",
      irrigate: "Every 3 days",
      fertilize: "At 30 and 60 days",
      harvest: "2025-11-20",
    }));
    setCropCalendar(calendar);
  }, [profile.crops]);

  // Initialize Web Speech API for Malayalam & English (browser dependent)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = "ml-IN"; // Malayalam (if supported)
    recog.continuous = false;
    recog.interimResults = false;

    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      handleUserQuery(text);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recog;
  }, []);

  function startListening() {
    if (!recognitionRef.current) return alert("Voice not supported in this browser");
    setTranscript("");
    setIsListening(true);
    recognitionRef.current.start();
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }

  // Basic handler to answer simple queries locally
  function handleUserQuery(text) {
    // VERY BASIC rule-based responses for now. Replace with LLM backend.
    const t = text.toLowerCase();
    if (t.includes("weather") || t.includes("വേന")) {
      fetchWeather();
      setAssistantReply("Fetching the latest weather for your location...");
    } else if (t.includes("pest") || t.includes("കീടം")) {
      setAssistantReply("Nearby pest alerts: " + pestAlerts.map((p) => p.title).join("; "));
    } else if (t.includes("subsidy") || t.includes("സബ്സിഡി")) {
      setAssistantReply("You may be eligible for PM-Kisan and state subsidies. Open the subsidies panel.");
    } else {
      setAssistantReply("നമസ്കാരം! നിങ്ങൾക്ക് എന്ത് സഹായം വേണം? (Try: 'weather', 'pest', 'subsidy')");
    }

    // Speak the reply using SpeechSynthesis
    const s = new SpeechSynthesisUtterance(assistantReply || "ഒന്ന് നാൾ..." );
    s.lang = "ml-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(s);
  }

  async function fetchWeather() {
    if (!profile.location) return alert("Please set your location in profile first.");
    setWeatherLoading(true);
    try {
      // TODO: Replace with real weather API (OpenWeatherMap / Google Weather)
      // Example OpenWeatherMap call (requires API key):
      // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(profile.location)}&appid=YOUR_API_KEY&units=metric`);
      // const data = await res.json();

      // Mock data for now:
      const data = {
        main: { temp: 28, humidity: 78 },
        weather: [{ description: "light rain" }],
        wind: { speed: 4.2 },
      };

      setWeather(data);
    } catch (e) {
      console.error(e);
      alert("Weather fetch failed - check API key or network.");
    } finally {
      setWeatherLoading(false);
    }
  }

  // Image upload -> preview + fake diagnosis (replace with ML model endpoint)
  function handleImageUpload(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setDiagnosis("Analyzing image... (send to ML pest model)");

    // Mock diagnosis delay
    setTimeout(() => {
      setDiagnosis("Possible leaf blast detected. Recommended: remove affected leaves, apply Tricyclazole as per dosage.");
    }, 1200);
  }

  // Simple mock: fetch latest subsidies (replace with government RSS / API)
  const subsidies = [
    { id: "pmkisan", title: "PM-KISAN - Income support for farmers", eligibility: "All small & marginal farmers" },
    { id: "soilhealth", title: "Soil Health Card Scheme - Free testing", eligibility: "All farmers" },
  ];

  // Save profile helper
  function updateProfileField(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  // Simple price history mock
  function fetchPriceHistory(crop) {
    // TODO: Replace with actual mandi price API
    const history = [
      { date: "2025-06-01", price: marketPrices.find((m) => m.crop === crop)?.price || 1000 },
      { date: "2025-07-01", price: marketPrices.find((m) => m.crop === crop)?.price + 50 || 1050 },
      { date: "2025-08-01", price: marketPrices.find((m) => m.crop === crop)?.price - 100 || 900 },
    ];
    return history;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AgriAssistant — Malayalam AI Helper</h1>
            <p className="text-sm text-gray-600">Localized advice · Voice & text · Weather · Pest alerts · Schemes · Market prices</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Logged in as</p>
            <p className="font-medium">{profile.name || "അമിത"}</p>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - profile & voice */}
          <section className="md:col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Profile / ഫാം വിവരങ്ങൾ</h2>
            <div className="space-y-2">
              <input className="w-full p-2 border rounded" placeholder="പേര്" value={profile.name} onChange={(e) => updateProfileField("name", e.target.value)} />
              <input className="w-full p-2 border rounded" placeholder="Location (town/district)" value={profile.location} onChange={(e) => updateProfileField("location", e.target.value)} />
              <input className="w-full p-2 border rounded" placeholder="Land size (in cents/acre)" value={profile.landSize} onChange={(e) => updateProfileField("landSize", e.target.value)} />
              <select className="w-full p-2 border rounded" value={profile.soilType} onChange={(e) => updateProfileField("soilType", e.target.value)}>
                <option>Loam</option>
                <option>Sandy</option>
                <option>Clay</option>
                <option>Laterite</option>
              </select>
              <select className="w-full p-2 border rounded" value={profile.irrigation} onChange={(e) => updateProfileField("irrigation", e.target.value)}>
                <option>Drip</option>
                <option>Flood</option>
                <option>Sprinkler</option>
                <option>Manual</option>
              </select>

              <div>
                <label className="text-sm">Crops (comma separated)</label>
                <input className="w-full p-2 border rounded" value={profile.crops.join(", ")} onChange={(e) => updateProfileField("crops", e.target.value.split(",").map((s) => s.trim()))} />
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => { localStorage.setItem("agri_profile", JSON.stringify(profile)); alert("Profile saved"); }}>Save</button>
                <button className="px-3 py-2 border rounded" onClick={() => { localStorage.removeItem("agri_profile"); setProfile({ name: "", location: "", landSize: "", soilType: "Loam", irrigation: "Drip", crops: ["Rice"] }); }}>Reset</button>
              </div>
            </div>

            <hr className="my-3" />

            <div>
              <h3 className="font-medium mb-1">Voice assistant (Malayalam)</h3>
              <div className="flex gap-2 items-center">
                <button className={`px-3 py-2 rounded ${isListening ? "bg-red-500 text-white" : "bg-green-500 text-white"}`} onClick={() => (isListening ? stopListening() : startListening())}>{isListening ? "Listening..." : "Start Voice"}</button>
                <button className="px-3 py-2 border rounded" onClick={() => handleUserQuery(prompt("Type a query (eg: weather, pest, subsidy)") || "")}>
                  Ask (text)
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <p><strong>Transcript:</strong> {transcript || "—"}</p>
                <p><strong>Assistant:</strong> {assistantReply || "—"}</p>
              </div>
            </div>
          </section>

          {/* Middle column - main features */}
          <section className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Weather (ജയാണ്)</h3>
                <div>
                  <div className="flex items-center gap-3">
                    <input className="p-2 border rounded" placeholder="Use profile location" value={profile.location} onChange={(e) => updateProfileField("location", e.target.value)} />
                    <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={fetchWeather}>{weatherLoading ? "Loading..." : "Get Weather"}</button>
                  </div>

                  {weather ? (
                    <div className="mt-3">
                      <p>Temperature: {weather.main.temp}°C</p>
                      <p>Humidity: {weather.main.humidity}%</p>
                      <p>Condition: {weather.weather[0].description}</p>
                      <p>Wind: {weather.wind.speed} m/s</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">No weather data yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Pest Alerts (അറിയിപ്പ്)</h3>
                <div className="space-y-2">
                  {pestAlerts.map((p) => (
                    <div key={p.id} className="p-2 border rounded flex justify-between items-center">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-gray-500">Detected: {p.date} · Severity: {p.severity}</p>
                      </div>
                      <div>
                        <button className="px-2 py-1 bg-yellow-500 rounded text-sm" onClick={() => alert("Open advisory for " + p.title)}>
                          See advice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Crop Calendar & Operations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cropCalendar.map((c, i) => (
                  <div key={i} className="p-3 border rounded">
                    <p className="font-medium">{c.crop}</p>
                    <p>Sow: {c.sow}</p>
                    <p>Irrigation: {c.irrigate}</p>
                    <p>Fertilizer: {c.fertilize}</p>
                    <p>Harvest: {c.harvest}</p>
                    <div className="mt-2 flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => alert('Reminder set for ' + c.crop)}>Set Reminder</button>
                      <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => alert('Detailed operations for ' + c.crop)}>Open Plan</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Subsidies & Schemes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subsidies.map((s) => (
                  <div key={s.id} className="p-2 border rounded">
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-gray-600">Eligibility: {s.eligibility}</p>
                    <div className="mt-1">
                      <button className="px-2 py-1 bg-indigo-600 text-white rounded" onClick={() => alert('Open application guide for ' + s.title)}>How to apply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Market Prices & Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {marketPrices.map((m, idx) => (
                  <div key={idx} className="p-2 border rounded">
                    <p className="font-medium">{m.crop}</p>
                    <p className="text-sm">{m.mandi} · ₹{m.price}/quintal</p>
                    <button className="mt-2 px-2 py-1 border rounded text-sm" onClick={() => alert(JSON.stringify(fetchPriceHistory(m.crop)))}>Show history</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Image-based Pest Diagnosis</h3>
              <div className="flex gap-4 items-center">
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                {imagePreview && <img src={imagePreview} alt="preview" className="w-32 h-24 object-cover rounded" />}
                <div>
                  <p className="text-sm">{diagnosis || "No diagnosis yet."}</p>
                  <p className="text-xs text-gray-500 mt-1">Tip: Use a clear close-up photo of the affected leaf.</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border">
              <strong>Offline & Low-bandwidth features:</strong>
              <ul className="list-disc ml-5 mt-2 text-sm">
                <li>SMS / IVR fallback (requires backend integration).</li>
                <li>Store essential advisories on device for offline access.</li>
                <li>Lightweight pages & image compression before upload.</li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-center text-sm text-gray-500">Built with ❤️ — replace mock endpoints with real APIs (OpenWeatherMap, state pest feeds, mandi price APIs, LLM backend)</footer>
      </div>
    </div>
  );
}
