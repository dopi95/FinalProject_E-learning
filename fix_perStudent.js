const fs = require('fs');
const file = 'c:/Users/Era/Desktop/Files/Final Project/Implementation/FinalProject_E-learning/frontend/src/pages/InstructorDashboard.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Change state init: object keyed by studentId instead of flat array
const oldInit = `  const [persistedGradeFields, setPersistedGradeFields] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gradeFields') || '[]'); } catch { return []; }
  });
  const savePersistedGradeFields = (fields) => {
    const saved = typeof fields === 'function' ? fields(persistedGradeFields) : fields;
    setPersistedGradeFields(saved);
    try { localStorage.setItem('gradeFields', JSON.stringify(saved)); } catch {}
  };`;

const newInit = `  const [persistedGradeFields, setPersistedGradeFields] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gradeFieldsMap') || '{}'); } catch { return {}; }
  });
  const savePersistedGradeFields = (studentId, fields) => {
    const resolved = typeof fields === 'function' ? fields(persistedGradeFields[studentId] || []) : fields;
    const updated = { ...persistedGradeFields, [studentId]: resolved };
    setPersistedGradeFields(updated);
    try { localStorage.setItem('gradeFieldsMap', JSON.stringify(updated)); } catch {}
  };
  const getPersistedForStudent = (studentId) => persistedGradeFields[studentId] || [];
  const clearPersistedForStudent = (studentId) => {
    const updated = { ...persistedGradeFields };
    delete updated[studentId];
    setPersistedGradeFields(updated);
    try { localStorage.setItem('gradeFieldsMap', JSON.stringify(updated)); } catch {}
  };`;

const oldInitCRLF = oldInit.replace(/\n/g, '\r\n');
const newInitCRLF = newInit.replace(/\n/g, '\r\n');
if (!c.includes(oldInitCRLF)) { console.error('oldInit NOT FOUND'); process.exit(1); }
c = c.replace(oldInitCRLF, newInitCRLF);
console.log('state init done');

// 2. Fix useEffect — use getPersistedForStudent
const oldMerge = `      const merged = [
        ...fields,
        ...persistedGradeFields.filter(p => !fields.some(f => f.name === p.name))
      ];
      if (merged.length > 0) {
        setGradeFields(merged);
        setGradeAutoPopulated(fields.length > 0);
        const total = merged.reduce((s, f) => s + parseFloat(f.mark || 0), 0);
        // Check attendance — auto NG if below 70%
        const attRecord = attendanceData.find(a => a.student._id === selectedStudentForGrading._id || a.student._id?.toString() === selectedStudentForGrading._id?.toString());
        if (attRecord && attRecord.percentage < 70) {
          setGradeLetter('NG');
        } else {
          setGradeLetter(getGradeLetter(total));
        }
      } else {
        const base = persistedGradeFields.length > 0 ? persistedGradeFields : [{ name: '', mark: '' }];
        setGradeFields(base);
        setGradeAutoPopulated(false);
        if (persistedGradeFields.length > 0) {
          const total = persistedGradeFields.reduce((s, f) => s + parseFloat(f.mark || 0), 0);
          setGradeLetter(getGradeLetter(total));`;

const newMerge = `      const sid = selectedStudentForGrading._id;
      const persisted = getPersistedForStudent(sid);
      const merged = [
        ...fields,
        ...persisted.filter(p => !fields.some(f => f.name === p.name))
      ];
      if (merged.length > 0) {
        setGradeFields(merged);
        setGradeAutoPopulated(fields.length > 0);
        const total = merged.reduce((s, f) => s + parseFloat(f.mark || 0), 0);
        // Check attendance — auto NG if below 70%
        const attRecord = attendanceData.find(a => a.student._id === selectedStudentForGrading._id || a.student._id?.toString() === selectedStudentForGrading._id?.toString());
        if (attRecord && attRecord.percentage < 70) {
          setGradeLetter('NG');
        } else {
          setGradeLetter(getGradeLetter(total));
        }
      } else {
        const base = persisted.length > 0 ? persisted : [{ name: '', mark: '' }];
        setGradeFields(base);
        setGradeAutoPopulated(false);
        if (persisted.length > 0) {
          const total = persisted.reduce((s, f) => s + parseFloat(f.mark || 0), 0);
          setGradeLetter(getGradeLetter(total));`;

const oldMergeCRLF = oldMerge.replace(/\n/g, '\r\n');
const newMergeCRLF = newMerge.replace(/\n/g, '\r\n');
if (!c.includes(oldMergeCRLF)) { console.error('oldMerge NOT FOUND'); process.exit(1); }
c = c.replace(oldMergeCRLF, newMergeCRLF);
console.log('useEffect merge done');

// 3. Fix Save button in single modal — pass studentId
const oldSaveSingle = `                              savePersistedGradeFields(prev => {
                                const updated = prev.filter(p => p.name !== newFields[index].name);
                                return [...updated, { ...newFields[index] }];
                              });`;
const newSaveSingle = `                              savePersistedGradeFields(selectedStudentForGrading._id, prev => {
                                const updated = prev.filter(p => p.name !== newFields[index].name);
                                return [...updated, { ...newFields[index] }];
                              });`;
const oldSaveSingleCRLF = oldSaveSingle.replace(/\n/g, '\r\n');
const newSaveSingleCRLF = newSaveSingle.replace(/\n/g, '\r\n');
if (!c.includes(oldSaveSingleCRLF)) { console.error('oldSaveSingle NOT FOUND'); process.exit(1); }
c = c.replace(oldSaveSingleCRLF, newSaveSingleCRLF);
console.log('save single done');

// 4. Fix Delete button in single modal — pass studentId
const oldDelSingle = `                              savePersistedGradeFields(prev => prev.filter(p => p.name !== gradeFields[index].name));`;
const newDelSingle = `                              savePersistedGradeFields(selectedStudentForGrading._id, prev => prev.filter(p => p.name !== gradeFields[index].name));`;
if (!c.includes(oldDelSingle)) { console.error('oldDelSingle NOT FOUND'); process.exit(1); }
c = c.replace(oldDelSingle, newDelSingle);
console.log('delete single done');

// 5. Fix submit in single modal — use clearPersistedForStudent
const oldSubmitSingle = `                        savePersistedGradeFields([]);`;
const newSubmitSingle = `                        clearPersistedForStudent(selectedStudentForGrading._id);`;
if (!c.includes(oldSubmitSingle)) { console.error('oldSubmitSingle NOT FOUND'); process.exit(1); }
c = c.replace(oldSubmitSingle, newSubmitSingle);
console.log('submit single done');

// 6. Fix Save button in bulk modal — bulk doesn't have a specific student, use 'bulk' key
const oldSaveBulk = `                            savePersistedGradeFields(prev => {
                              const updated = prev.filter(p => p.name !== f[index].name);
                              return [...updated, { ...f[index] }];
                            });`;
const newSaveBulk = `                            savePersistedGradeFields('bulk', prev => {
                              const updated = prev.filter(p => p.name !== f[index].name);
                              return [...updated, { ...f[index] }];
                            });`;
const oldSaveBulkCRLF = oldSaveBulk.replace(/\n/g, '\r\n');
const newSaveBulkCRLF = newSaveBulk.replace(/\n/g, '\r\n');
if (!c.includes(oldSaveBulkCRLF)) { console.error('oldSaveBulk NOT FOUND'); process.exit(1); }
c = c.replace(oldSaveBulkCRLF, newSaveBulkCRLF);
console.log('save bulk done');

// 7. Fix Delete in bulk modal
const oldDelBulk = `savePersistedGradeFields(prev=>prev.filter(p=>p.name!==removed.name));`;
const newDelBulk = `savePersistedGradeFields('bulk', prev=>prev.filter(p=>p.name!==removed.name));`;
if (!c.includes(oldDelBulk)) { console.error('oldDelBulk NOT FOUND'); process.exit(1); }
c = c.replace(oldDelBulk, newDelBulk);
console.log('delete bulk done');

// 8. Fix submit in bulk modal — clear bulk key
const oldSubmitBulk = `                      savePersistedGradeFields([]);`;
const newSubmitBulk = `                      clearPersistedForStudent('bulk');`;
if (!c.includes(oldSubmitBulk)) { console.error('oldSubmitBulk NOT FOUND'); process.exit(1); }
c = c.replace(oldSubmitBulk, newSubmitBulk);
console.log('submit bulk done');

// 9. Fix bulk modal open — restore from 'bulk' key
const oldBulkOpen = `                    setGradeFields([{ name: '', mark: '' }]);
                    setGradeLetter('');
                    setGradeAutoPopulated(false);
                    setShowBulkGradeModal(true);`;
const newBulkOpen = `                    const bulkPersisted = getPersistedForStudent('bulk');
                    setGradeFields(bulkPersisted.length > 0 ? bulkPersisted : [{ name: '', mark: '' }]);
                    setGradeLetter('');
                    setGradeAutoPopulated(false);
                    setShowBulkGradeModal(true);`;
const oldBulkOpenCRLF = oldBulkOpen.replace(/\n/g, '\r\n');
const newBulkOpenCRLF = newBulkOpen.replace(/\n/g, '\r\n');
if (!c.includes(oldBulkOpenCRLF)) { console.error('oldBulkOpen NOT FOUND'); process.exit(1); }
c = c.replace(oldBulkOpenCRLF, newBulkOpenCRLF);
console.log('bulk open done');

fs.writeFileSync(file, c, 'utf8');
console.log('File saved successfully');
