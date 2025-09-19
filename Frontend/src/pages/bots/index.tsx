import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Plus, Trash2, X, Save } from "lucide-react";

interface Bot {
  uid: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function Botpage(): ReactElement {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotUid, setSelectedBotUid] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const selectedBot = useMemo(
    () => bots.find((b) => b.uid === selectedBotUid) ?? null,
    [bots, selectedBotUid]
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  const FetchBots = async (): Promise<Bot[]> => {
    try {
      const response = await fetch(import.meta.env.VITE_SERVER_API_URL + "/bots");
      if (!response.ok) {
        throw new Error(`Error fetching bots: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      const botsList: Bot[] = data.bots.map((bot: any) => ({
        uid: bot.uid,
        name: bot.name,
        description: bot.prompt, 
        createdAt: bot.created_at
      }));
  
      setBots(botsList);
      return botsList;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  const CreateBot = async (options?: { openAndSelect?: boolean }) => {
    if (!newName.trim()) return alert("Please enter a bot name");
  
    try {
      const response = await fetch(import.meta.env.VITE_SERVER_API_URL + "/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          prompt: newDescription.trim(), 
        }),
      });
  
      if (!response.ok) throw new Error("Failed to create bot");
  
      const createdBot = await response.json();

      const bot: Bot = {
        uid: createdBot.uid,
        name: createdBot.name,
        description: createdBot.prompt,
        createdAt: createdBot.created_at,
      };
  
      const next = [bot, ...bots];
      setBots(next);
  
      setNewName("");
      setNewDescription("");
      setIsCreateOpen(false);
  
      if (options?.openAndSelect) setSelectedBotUid(bot.uid);
    } catch (err) {
      console.error("CreateBot error:", err);
    }
  };
  const UpdateBot = async () => {
    if (!selectedBot) return;
  
    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_API_URL + `/bots/${selectedBot.uid}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name:editName.trim() ,prompt: editDescription.trim() }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to update bot");
  
      const updatedBot = await response.json();
  
      const next = bots.map((b) =>
        b.uid === selectedBot.uid
          ? {
              ...b,
              name: editName,
              description: updatedBot.prompt,
            }
          : b
      );
  
      setBots(next);
    } catch (err) {
      console.error(" UpdateBot error:", err);
    }
  };
  const DeleteBot = async (uid: string) => {
    if (!confirm("Delete this bot?")) return;
  
    try {
      const response = await fetch(
        import.meta.env.VITE_SERVER_API_URL + `/bots/${uid}`,
        { method: "DELETE" }
      );
  
      if (!response.ok) throw new Error("Failed to delete bot");
  
      const next = bots.filter((b) => b.uid !== uid);
      setBots(next);
  
      if (selectedBotUid === uid) setSelectedBotUid(null);
    } catch (err) {
      console.error("❌ DeleteBot error:", err);
    }
  };

  useEffect(() => {
    FetchBots()
  }, []);

  useEffect(() => {
    setEditName(selectedBot?.name ?? "");
    setEditDescription(selectedBot?.description ?? "");
  }, [selectedBotUid, selectedBot]);


  return (
    <div className="w-full h-full flex justify-center items-start bg-[#0f1117] p-6">
      <div className="w-full max-w-7xl h-[84vh] bg-[#1c1e26] rounded-xl shadow-2xl flex overflow-hidden border border-[#2c2e3a]">
        <div className="w-80 border-r border-[#2c2e3a] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Bots</h3>
              <p className="text-sm text-gray-400">
                Manage and configure your bots
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm transition"
            >
              <Plus size={16} /> New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {bots.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400">No bots created yet</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow"
                >
                  + Create Bot
                </button>
              </div>
            ) : (
              bots.map((bot) => (
                <div
                  key={bot.uid}
                  onClick={() => setSelectedBotUid(bot.uid)}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition
                    ${
                      selectedBotUid === bot.uid
                        ? "bg-emerald-500/10 border border-emerald-500/40"
                        : "hover:bg-[#2c2e3a]"
                    }`}
                >
                  <div>
                    <div className="text-sm font-medium text-white">
                      {bot.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {bot.uid}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      DeleteBot(bot.uid);
                    }}
                    className="p-2 rounded-md hover:bg-red-500/20 transition text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Made by Abhinav
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {selectedBot ? (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-1">
                {selectedBot.name}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                UID:{" "}
                <span className="font-mono text-xs text-gray-400">
                  {selectedBot.uid}
                </span>
              </p>

              <div className="bg-[#2c2e3a] rounded-xl p-6 space-y-6 border border-[#3a3d4d]">
                <div>
                  <label className="block text-sm text-gray-400">Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-2 w-full rounded-md border border-[#3a3d4d] bg-[#0f1117] text-white p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400">
                    Prompt
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={9}
                    className="mt-2 w-full rounded-md border border-[#3a3d4d] bg-[#0f1117] text-white p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={UpdateBot}
                    className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 shadow"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditName(selectedBot.name);
                      setEditDescription(selectedBot.description ?? "");
                    }}
                    className="px-4 py-2 rounded-md bg-[#2c2e3a] hover:bg-[#3a3d4d] text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                Create your first bot
              </h2>
              <p className="text-gray-400 max-w-md">
                No bot selected. Create one to get started or pick from the list
                on the left.
              </p>

            </div>
          )}
        </div>
      </div>


      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4">
            <div className="bg-[#1c1e26] rounded-xl p-6 shadow-2xl border border-[#2c2e3a]">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Create a new bot
                  </h3>
                  <p className="text-sm text-gray-400">
                    Give your bot a name and description.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 rounded-md hover:bg-[#2c2e3a] text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400">Name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Receptionist"
                    className="mt-2 w-full rounded-md border border-[#3a3d4d] bg-[#0f1117] text-white p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">
                    Prompt
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What should this bot do?"
                    rows={4}
                    className="mt-2 w-full rounded-md border border-[#3a3d4d] bg-[#0f1117] text-white p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-md bg-[#2c2e3a] hover:bg-[#3a3d4d] text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => CreateBot({ openAndSelect: true })}
                    className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow"
                  >
                    Create Bot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
