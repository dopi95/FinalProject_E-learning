const fs = require('fs');
const file = 'c:/Users/Era/Desktop/Files/Final Project/Implementation/FinalProject_E-learning/frontend/src/pages/StudentDashboard.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Add attendance state after enrolledCourses state
const oldState = "  const [enrolledCourses, setEnrolledCourses] = useState([]);";
const newState = "  const [enrolledCourses, setEnrolledCourses] = useState([]);\r\n  const [myAttCourseSel, setMyAttCourseSel] = useState('');\r\n  const [myAttData, setMyAttData] = useState(null);\r\n  const [myAttLoading, setMyAttLoading] = useState(false);";
if (!c.includes(oldState)) { console.error('oldState NOT FOUND'); process.exit(1); }
c = c.replace(oldState, newState);
console.log('state done');

// 2. Replace tab definition
const oldTab = "{ id: 'progress', name: 'Progress', icon: TrendingUp }";
const newTab = "{ id: 'progress', name: 'My Attendance', icon: TrendingUp }";
if (!c.includes(oldTab)) { console.error('oldTab NOT FOUND'); process.exit(1); }
c = c.replace(oldTab, newTab);
console.log('tab done');

// 3. Replace renderProgress function entirely
const oldRender = `  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Progress</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Progress</h3>
          <div className="space-y-4">
            {['Mathematics', 'Physics', 'Chemistry'].map((subject, index) => (
              <div key={subject}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{subject}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{75 + index * 5}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: \`\${75 + index * 5}%\` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Overall Performance</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-gray-600 dark:text-gray-400">Average Grade</p>
          </div>
        </div>
      </div>
    </div>
  );`;

const newRender = `  const fetchMyAttendance = async (courseId) => {
    if (!courseId) return;
    try {
      setMyAttLoading(true);
      const res = await attendanceAPI.getMyAttendance(courseId);
      setMyAttData(res.data);
    } catch {
      setMyAttData(null);
    } finally {
      setMyAttLoading(false);
    }
  };

  const renderProgress = () => {
    const att = myAttData;
    const isNG = att && att.percentage < 70;
    return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h2>

      {/* Course selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
        <select
          value={myAttCourseSel}
          onChange={(e) => { setMyAttCourseSel(e.target.value); fetchMyAttendance(e.target.value); }}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-sm"
        >
          <option value="">-- Select a course --</option>
          {enrolledCourses.map(course => (
            <option key={course._id} value={course._id}>{course.title}</option>
          ))}
        </select>
      </div>

      {!myAttCourseSel ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Select a course to view your attendance</p>
        </div>
      ) : myAttLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !att || att.total === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No attendance records yet for this course.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Attendance is recorded when you click "Join Class" on time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 lg:p-5 rounded-2xl shadow text-center">
              <p className="text-2xl lg:text-3xl font-bold text-blue-600">{att.attended}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sessions Attended</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 lg:p-5 rounded-2xl shadow text-center">
              <p className="text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-200">{att.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Sessions</p>
            </div>
            <div className={`p-3 lg:p-5 rounded-2xl shadow text-center ${isNG ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
              <p className={`text-2xl lg:text-3xl font-bold ${isNG ? 'text-red-600' : 'text-green-600'}`}>{att.percentage}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Attendance Rate</p>
            </div>
          </div>

          {/* Progress bar card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Attendance Progress</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isNG ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : att.percentage >= 85 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                {isNG ? 'NG Risk' : att.percentage >= 85 ? 'Good' : 'Warning'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-3">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${isNG ? 'bg-red-500' : att.percentage >= 85 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: \`\${att.percentage}%\` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0%</span>
              <span className="text-red-500 font-medium">70% minimum</span>
              <span>100%</span>
            </div>
            {/* 70% marker */}
            <div className="relative mt-1">
              <div className="absolute h-3 w-0.5 bg-red-400" style={{ left: '70%' }} />
            </div>

            {isNG ? (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ Your attendance is below 70%. You may receive an NG grade.</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">You need to attend {Math.ceil((0.7 * att.total) - att.attended)} more session{Math.ceil((0.7 * att.total) - att.attended) !== 1 ? 's' : ''} to reach 70%.</p>
              </div>
            ) : att.percentage < 85 ? (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">⚡ Keep it up! Try to maintain above 85% attendance.</p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">✅ Excellent attendance! Keep it up.</p>
              </div>
            )}
          </div>

          {/* Sessions breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Sessions Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: att.total }, (_, i) => (
                <div
                  key={i}
                  className={\`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold \${i < att.attended ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'}\`}
                  title={\`Session \${i + 1}: \${i < att.attended ? 'Attended' : 'Missed'}\`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500"></div> Attended</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-600"></div> Missed</div>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };`;

const oldRenderCRLF = oldRender.replace(/\n/g, '\r\n');
const newRenderCRLF = newRender.replace(/\n/g, '\r\n');
if (!c.includes(oldRenderCRLF)) { console.error('oldRender NOT FOUND'); process.exit(1); }
c = c.replace(oldRenderCRLF, newRenderCRLF);
console.log('render done');

fs.writeFileSync(file, c, 'utf8');
console.log('File saved successfully');
