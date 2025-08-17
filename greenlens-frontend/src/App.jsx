import React, { useState, useEffect } from 'react';
import { Leaf, Camera, Award, MapPin, XCircle, RefreshCcw, Upload, Clock } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const App = () => {
  const [user, setUser] = useState({ ecoPoints: 0, co2Saved: 0, history: [] });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [view, setView] = useState('dashboard');
  const [scannedItem, setScannedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user + leaderboard from backend
  useEffect(() => {
    fetchUser();
    fetchLeaderboard();
  }, []);

  const fetchUser = async () => {
    const res = await fetch(`${API_BASE}/api/user`);
    const data = await res.json();
    setUser(data);
  };

  const fetchLeaderboard = async () => {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    const data = await res.json();
    setLeaderboardData(data);
  };

  // Dashboard
  const Dashboard = () => (
    <div className="flex flex-col items-center p-6 space-y-6">
      <div className="flex items-center space-x-2 text-emerald-600">
        <Leaf size={32} />
        <h2 className="text-3xl font-bold">Your Impact</h2>
      </div>
      <div className="flex justify-around w-full">
        <div className="text-center bg-white p-4 rounded-xl shadow-lg border border-gray-200 w-1/2 mx-2">
          <p className="text-4xl font-extrabold text-emerald-600">{user.ecoPoints}</p>
          <p className="text-sm font-medium text-gray-500">Eco-Points</p>
        </div>
        <div className="text-center bg-white p-4 rounded-xl shadow-lg border border-gray-200 w-1/2 mx-2">
          <p className="text-4xl font-extrabold text-emerald-600">{user.co2Saved} kg</p>
          <p className="text-sm font-medium text-gray-500">CO₂ Saved</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <button onClick={() => setView('scanner')} className="bg-emerald-500 text-white py-4 px-6 rounded-xl shadow-lg hover:bg-emerald-600 transition flex items-center justify-center space-x-2">
          <Camera size={24} /><span className="font-semibold text-lg">Scan an Item</span>
        </button>
        <button onClick={() => setView('leaderboard')} className="bg-blue-500 text-white py-4 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition flex items-center justify-center space-x-2">
          <Award size={24} /><span className="font-semibold text-lg">Leaderboard</span>
        </button>
        <button onClick={() => setView('recycling-centers')} className="bg-indigo-500 text-white py-4 px-6 rounded-xl shadow-lg hover:bg-indigo-600 transition flex items-center justify-center space-x-2">
          <MapPin size={24} /><span className="font-semibold text-lg">Find Recycling Centers</span>
        </button>
        <button onClick={() => setView('history')} className="bg-purple-500 text-white py-4 px-6 rounded-xl shadow-lg hover:bg-purple-600 transition flex items-center justify-center space-x-2">
          <Clock size={24} /><span className="font-semibold text-lg">History</span>
        </button>
      </div>
    </div>
  );

  // Scanner
  const Scanner = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFileToUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => setUploadedImage(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const handleScan = async () => {
      if (!fileToUpload) return;

      setIsLoading(true);
      setScannedItem(null);

      const formData = new FormData();
      formData.append('file', fileToUpload);

      try {
        const res = await fetch(`${API_BASE}/api/scan`, { method: 'POST', body: formData });
        const data = await res.json();

        setScannedItem({ ...data, image: uploadedImage });

        // Refresh user + leaderboard
        await fetchUser();
        await fetchLeaderboard();

      } catch (error) {
        setScannedItem({ type: "Unknown", info: "Server error", image: uploadedImage });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex flex-col items-center p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-700">Upload & Scan an Item</h2>
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg border aspect-video flex items-center justify-center">
          {uploadedImage ? <img src={uploadedImage} alt="preview" className="w-full h-full object-contain" /> : <div className="text-gray-400"><Upload size={48} /><p>Upload an image</p></div>}
        </div>
        <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <label htmlFor="file-upload" className="bg-blue-500 text-white py-3 px-6 rounded-full cursor-pointer hover:bg-blue-600 flex items-center space-x-2">
          <Upload size={20} /><span>Choose Image</span>
        </label>
        <button onClick={handleScan} disabled={isLoading || !uploadedImage} className="bg-emerald-500 text-white py-3 px-6 rounded-full flex items-center space-x-2 disabled:opacity-50">
          {isLoading ? <><RefreshCcw size={20} className="animate-spin" /><span>Scanning...</span></> : <><Camera size={20} /><span>Scan</span></>}
        </button>

        {/* Scan Results with classification left, details right */}
        {scannedItem && (
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mt-6">
            <h3 className="text-xl font-bold mb-4">Scan Results</h3>
            <div className="flex items-start space-x-6">
              {/* Left side: classification + image */}
              <div className="flex-shrink-0 w-32 text-center">
                <p className={`text-2xl font-extrabold ${scannedItem.type === "Unknown" ? "text-red-500" : "text-emerald-600"}`}>
                  {scannedItem.type}
                </p>
                <img
                  src={scannedItem.image}
                  alt="Scanned item"
                  className="w-28 h-28 object-cover rounded-lg mt-3 mx-auto"
                />
              </div>

              {/* Right side: details */}
              <div className="flex-1">
                <p className="text-gray-700 font-medium">{scannedItem.info}</p>
                <p className="text-sm text-gray-500 mt-2">
                  +{scannedItem.points || 0} points | {scannedItem.co2 || 0}kg CO₂ saved
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Leaderboard
  const Leaderboard = () => (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">Leaderboard</h2>
      <ul className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 divide-y">
        {leaderboardData.map((u, i) => (
          <li key={i} className="py-2 flex justify-between">
            <span className="font-medium">{i + 1}. {u.name}</span>
            <span className="font-bold text-emerald-600">{u.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // History with left/right layout
  const History = () => (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">Your History</h2>
      <ul className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 divide-y">
        {user.history.slice().reverse().map((item, i) => (
          <li key={i} className="py-3 flex items-start space-x-6">
            {/* Left side: classification */}
            <div className="flex-shrink-0 w-28 text-center">
              <p className="font-bold text-emerald-600">{item.type}</p>
            </div>

            {/* Right side: details */}
            <div className="flex-1">
              <p className="text-sm text-gray-600">{item.info}</p>
              <p className="text-xs text-gray-400">
                +{item.points} pts | {item.co2}kg CO₂ | {new Date(item.timestamp*1000).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // Recycling Centers
  const RecyclingCenters = () => (
    <div className="flex flex-col items-center p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-700">Recycling Centers</h2>
      <ul className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 space-y-2">
        <li><p className="font-bold">Eco Hub</p><p className="text-sm text-gray-500">123 Green St</p></li>
        <li><p className="font-bold">Community Center</p><p className="text-sm text-gray-500">456 Oak Ave</p></li>
      </ul>
    </div>
  );

  // Render selected view
  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'scanner': return <Scanner />;
      case 'leaderboard': return <Leaderboard />;
      case 'history': return <History />;
      case 'recycling-centers': return <RecyclingCenters />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow-md flex justify-between">
        <h1 className="text-xl font-bold text-emerald-600 flex items-center space-x-2"><Leaf size={24} /><span>GreenLens+</span></h1>
        {view !== 'dashboard' && <button onClick={() => setView('dashboard')}><XCircle size={24} className="text-gray-500 hover:text-emerald-600" /></button>}
      </header>
      <main className="p-4">{renderView()}</main>
    </div>
  );
};

export default App;
