import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import ThreeGraph from '../components/ThreeGraph';
import FallbackGrid from '../components/FallbackGrid';
import { api } from '../services/api';
import { 
  Terminal, Calendar, MessageSquare, Compass, BellRing, Sparkles, BookOpen, 
  Send, User, LogOut, CheckCircle, RefreshCcw, ExternalLink, Play, Code 
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  // Navigation: 'dashboard' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard & Graph States
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [improvementPlan, setImprovementPlan] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [show3D, setShow3D] = useState(true);
  
  // Timetable
  const [timetable, setTimetable] = useState([]);
  const [batchNo, setBatchNo] = useState('');
  
  // AI Mentor Chat
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([
    { role: 'mentor', content: 'Welcome back! How is your learning going today? Click any node on the graph to study that specific module, or ask me a query.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Online Compiler Sandbox Drawer
  const [showCompiler, setShowCompiler] = useState(false);
  const [codeLang, setCodeLang] = useState('python');
  const [codeBody, setCodeBody] = useState('print("Hello College Fresher!")');
  const [compilerStdout, setCompilerStdout] = useState('');
  const [compilerStatus, setCompilerStatus] = useState('');
  const [compilerLoading, setCompilerLoading] = useState(false);

  // Weekend Test
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Class Map Routing planner state
  const [showMap, setShowMap] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch timetable schedule
      const ttData = await api.getTimetable();
      setTimetable(ttData.schedule || []);
      setBatchNo(ttData.batch_no || '');

      // 2. Fetch notifications
      const notifs = await api.getNotifications();
      setNotifications(notifs || []);

      // 3. Load quizzes
      const quizList = await api.getQuizzes();
      setQuizzes(quizList || []);

      // 4. Default graph nodes list mapping
      setNodes([
        { id: 'html', label: 'HTML & CSS Layouts', status: 'mastered', details: 'Core semantics, flexbox grids, and CSS canvas styling.' },
        { id: 'js', label: 'JavaScript Async', status: 'learning', details: 'Promises, callbacks, fetch API integration.' },
        { id: 'three', label: 'Three.js & Canvas', status: 'gap', details: 'Initializing webgl contexts and drawing 3D geometry objects.' },
        { id: 'supabase', label: 'Supabase DB Schema', status: 'learning', details: 'Relational design, foreign keys, and RLS policies.' }
      ]);
      setEdges([
        { source: 'html', target: 'js' },
        { source: 'js', target: 'three' },
        { source: 'js', target: 'supabase' }
      ]);
      setImprovementPlan([
        { step: 'Study Left/Right Joins in SQLBolt', resource: 'SQLBolt Lesson 6', eta_days: 2 },
        { step: 'Create a static Three.js scene with a cube', resource: 'ThreeJS Docs', eta_days: 4 }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard indices:', err);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatLogs(prev => [...prev, { role: 'student', content: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.sendMentorMessage(userMessage);
      setChatLogs(prev => [...prev, { role: 'mentor', content: res.response }]);
    } catch (err) {
      setChatLogs(prev => [...prev, { role: 'mentor', content: 'Connection issue. Failed to reach AI mentor: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRunCompiler = async () => {
    setCompilerLoading(true);
    setCompilerStdout('');
    try {
      const res = await api.compileCode(codeLang, codeBody);
      setCompilerStdout(res.stdout);
      setCompilerStatus(res.status);
    } catch (err) {
      setCompilerStdout('Compilation Error: ' + err.message);
      setCompilerStatus('failed');
    } finally {
      setCompilerLoading(false);
    }
  };

  const handleGenerateNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.triggerNotificationCron();
      setNotifications(prev => [...res.notifications, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleQuizAnswer = (questionIdx, optionIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer_index) {
        correctCount++;
      }
    });

    try {
      const res = await api.submitQuiz(
        activeQuiz.id, 
        correctCount, 
        activeQuiz.questions.length, 
        Object.values(quizAnswers),
        activeQuiz.category_name || 'DB General'
      );
      
      setQuizResult(res);
      setQuizSubmitted(true);
      
      // Update graph directly using response
      if (res.new_graph) {
        setNodes(res.new_graph.nodes);
        setEdges(res.new_graph.edges);
        setImprovementPlan(res.improvement_plan);
      }
    } catch (err) {
      alert('Quiz submit failed: ' + err.message);
    }
  };

  const selectNodeToStudy = (node) => {
    setSelectedNode(node);
    setChatLogs(prev => [
      ...prev, 
      { role: 'mentor', content: `You selected "${node.label}" (Status: ${node.status}). What details would you like me to clarify regarding this skill node?` }
    ]);
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || 'Syllabus';
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 py-4 px-6 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h1 className="text-lg font-bold text-white tracking-wide">STUDENT HUB</h1>
        </div>

        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'dashboard' ? 'text-purple-400 border-b border-purple-400 pb-1' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'profile' ? 'text-purple-400 border-b border-purple-400 pb-1' : 'text-slate-400 hover:text-white'}`}
          >
            Profile
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline">{user.email}</span>
          <button 
            onClick={onLogout}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Column 1 & 2: Main Workspace */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Skill RoadMap & Knowledge Graph */}
              <GlassCard>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                      <Compass className="h-4 w-4 text-purple-400" />
                      3D Skill Roadmap
                    </h3>
                    <p className="text-[11px] text-slate-500">Interactive curriculum map generated by AI.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShow3D(!show3D)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-white rounded-lg px-2.5 py-1.5 border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      {show3D ? 'Switch to 2D' : 'Switch to 3D'}
                    </button>
                  </div>
                </div>

                <div className="h-[400px] border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20 flex items-center justify-center relative">
                  {show3D ? (
                    <ThreeGraph nodes={nodes} edges={edges} onNodeClick={selectNodeToStudy} />
                  ) : (
                    <div className="p-4 w-full h-full overflow-y-auto">
                      <FallbackGrid nodes={nodes} onNodeClick={selectNodeToStudy} />
                    </div>
                  )}
                </div>

                {selectedNode && (
                  <div className="mt-4 p-4 rounded-xl border border-purple-500/20 bg-purple-900/10 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{selectedNode.label}</h4>
                      <p className="text-xs text-slate-300 mt-1">{selectedNode.details}</p>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="mt-3 text-[10px] text-purple-400 hover:underline w-fit self-end"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </GlassCard>

              {/* 2. Timetable & Calendar */}
              <GlassCard>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-400" />
                      Your Timetable
                    </h3>
                    <p className="text-[11px] text-slate-500">Scheduled classroom lectures for batch: {batchNo || 'CSE-2026'}</p>
                  </div>
                  <button 
                    onClick={() => setShowMap(!showMap)} 
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    View Campus Route Map <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timetable.map(slot => (
                    <div 
                      key={slot.id} 
                      onClick={() => setSelectedRoom(slot.classroom)}
                      className="p-3.5 rounded-xl border border-white/5 bg-slate-900/30 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">{getDayName(slot.day_of_week)}</div>
                        <h4 className="text-xs font-bold text-white mt-0.5">{slot.subject_name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{slot.classroom}</p>
                      </div>
                      <div className="text-right border-l border-white/5 pl-4">
                        <div className="text-[10px] font-mono text-slate-400">{slot.start_time} - {slot.end_time}</div>
                        <div className="text-[9px] text-slate-500 mt-1 italic">{slot.faculty_records?.name}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Campus Map Route Simulation Modal */}
                {showMap && (
                  <div className="mt-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 relative">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Campus Interactive Map Router</h4>
                    <div className="p-4 bg-slate-950 border border-white/10 rounded-lg text-center text-xs text-slate-400 font-mono">
                      [Map Render: Academic Block C &rarr; Lab Block D]
                      <div className="mt-2 text-cyan-300">
                        {selectedRoom ? `Selected Room: ${selectedRoom}. Route: Enter Block C stairs, head to level 3.` : 'Select any lecture class card to map direction.'}
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowMap(false)}
                      className="absolute top-3 right-3 text-xs text-slate-500 hover:underline"
                    >
                      Close Map
                    </button>
                  </div>
                )}
              </GlassCard>

              {/* 3. Action Buttons Section */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCompiler(true)}
                  className="flex-1 py-3 px-4 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Code className="h-4 w-4" />
                  Launch Sandbox Compiler
                </button>

                {quizzes.length > 0 && (
                  <button 
                    onClick={() => {
                      setActiveQuiz(quizzes[0]);
                      setQuizSubmitted(false);
                      setQuizResult(null);
                      setQuizAnswers({});
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <BookOpen className="h-4 w-4" />
                    Attempt Weekend Quiz
                  </button>
                )}
              </div>

            </div>

            {/* Column 3: Side Panels */}
            <div className="space-y-6">
              
              {/* 1. AI Mentor Chat Panel */}
              <GlassCard className="flex flex-col h-[400px]">
                <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Growth Mentor
                </h3>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4 text-xs">
                  {chatLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl max-w-[85%] ${
                        log.role === 'mentor' 
                          ? 'bg-slate-900 border border-white/5 text-slate-300 mr-auto' 
                          : 'bg-purple-600 text-white ml-auto'
                      }`}
                    >
                      {log.content}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="bg-slate-900 border border-white/5 text-slate-500 p-3 rounded-xl mr-auto w-fit animate-pulse">
                      Mentor is typing...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Send Message Input */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask study queries..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  />
                  <button 
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </GlassCard>

              {/* 2. Notifications Timeline Panel */}
              <GlassCard>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-cyan-400" />
                    Feed Timeline
                  </h3>
                  <button 
                    onClick={handleGenerateNotifications}
                    disabled={notifLoading}
                    className="text-[9px] text-purple-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    Generate AI Alert
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        notif.is_read 
                          ? 'bg-slate-900/10 border-white/5 opacity-55' 
                          : 'bg-cyan-950/15 border-cyan-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-200">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md block mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{notif.content}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>

          </div>
        ) : (
          /* Profile Tab View */
          <div className="max-w-4xl mx-auto space-y-6">
            <GlassCard>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <User className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user.email}</h3>
                  <p className="text-xs text-slate-400 font-mono">Roll: {user.roll_no || 'TBD'} | Batch: {batchNo || 'TBD'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Assigned Domain Track</h4>
                  <div className="p-3 bg-slate-950/40 border border-white/10 rounded-xl">
                    <span className="text-sm font-semibold text-white">{user.domain_track || 'Analyzing interests...'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Identified Skill Target / Roadmap Gaps</h4>
                  <ul className="space-y-2">
                    {improvementPlan.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-950/30 p-2 rounded-lg border border-white/5">
                        <CheckCircle className="h-3.5 w-3.5 text-slate-500" />
                        <span>{step.step} (<span className="text-[10px] text-cyan-400 font-mono">{step.eta_days}d</span>)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard>
              <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase mb-3">Study Circles & Peers</h3>
              <p className="text-xs text-slate-400 mb-4 font-light">Interact with peers in your batch using Supabase Realtime messaging channel subscription.</p>
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl text-center text-xs text-slate-500 font-mono">
                [Study Circle: Web Dev Circle Active]
                <div className="mt-2 text-purple-400">
                  Status: Subscribed to room updates. (Realtime Active)
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>

      {/* Online Compiler Dialog Modal Overlay */}
      {showCompiler && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-3xl border border-white/15" glow={true}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="h-4 w-4 text-purple-400" />
                Code Sandbox Compiler
              </h3>
              <button 
                onClick={() => setShowCompiler(false)}
                className="text-xs text-slate-500 hover:text-white"
              >
                Exit Compiler
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Language</label>
                  <select 
                    value={codeLang} 
                    onChange={(e) => {
                      const lang = e.target.value;
                      setCodeLang(lang);
                      if (lang === 'python') setCodeBody('print("Hello College Fresher!")');
                      else if (lang === 'sql') setCodeBody('SELECT * FROM profiles LIMIT 5;');
                      else if (lang === 'c' || lang === 'cpp') setCodeBody('#include <stdio.h>\nint main() {\n    printf("Hello C!\\n");\n    return 0;\n}');
                      else if (lang === 'java') setCodeBody('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java!");\n    }\n}');
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="python">Python 3</option>
                    <option value="sql">SQL (PostgreSQL)</option>
                    <option value="c">C (GCC)</option>
                    <option value="cpp">C++ (G++)</option>
                    <option value="java">Java 17</option>
                  </select>
                </div>

                <button
                  onClick={handleRunCompiler}
                  disabled={compilerLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  {compilerLoading ? 'Executing code...' : 'Execute Sandbox'}
                </button>

                <div className="pt-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Execution Status</div>
                  <div className="p-2 bg-slate-950 rounded-lg text-xs border border-white/5">
                    {compilerStatus ? (
                      <span className={compilerStatus === 'completed' ? 'text-green-400' : 'text-red-400'}>
                        {compilerStatus.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-slate-500">Waiting for trigger...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Code input */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Editor</label>
                  <textarea
                    rows={8}
                    value={codeBody}
                    onChange={(e) => setCodeBody(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Output Console</label>
                  <pre className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 border border-white/10 font-mono min-h-[80px] overflow-x-auto whitespace-pre-wrap">
                    {compilerStdout || 'Console output displays here...'}
                  </pre>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Weekend Quiz Modal Overlay */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-xl border border-white/15" glow={true}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Weekend Test: {activeQuiz.title}
              </h3>
              <button 
                onClick={() => setActiveQuiz(null)}
                className="text-xs text-slate-500 hover:text-white"
              >
                Quit Quiz
              </button>
            </div>

            {!quizSubmitted ? (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 font-light">{activeQuiz.description}</p>
                
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2 border-t border-white/5 pt-3">
                    <div className="text-xs text-white font-medium">{qIdx + 1}. {q.question}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleQuizAnswer(qIdx, oIdx)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                            quizAnswers[qIdx] === oIdx 
                              ? 'bg-purple-900/30 border-purple-500 text-white font-semibold' 
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md mt-4"
                >
                  Submit Assessment Answers
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-base font-bold text-white">Quiz Evaluation Completed!</h4>
                <div className="text-3xl font-bold text-emerald-400">{quizResult?.score || 0} / {quizResult?.total_questions || 3}</div>
                <p className="text-xs text-slate-400 px-8">
                  Your answers have been processed. Gemini has re-drawn your active 3D Knowledge Graph highlighting any new Gaps or milestones. Check your Dashboard!
                </p>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-6 py-2 rounded-xl transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
