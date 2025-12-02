// public/app.js

// Chuyển tab
document.querySelectorAll('.menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const target = btn.dataset.target;
    document.getElementById(target).classList.add('active');
  });
});

// Helper fetch
async function callApi(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(err);
    return { ok: false, status: 0, data: { error: 'Network error' } };
  }
}

// 1. Top courses
document.getElementById('form-top-courses').addEventListener('submit', async (e) => {
  e.preventDefault();
  const year = document.getElementById('year').value;
  const minReview = document.getElementById('minReview').value;

  const { ok, status, data } = await callApi(
    `/api/top-courses?year=${encodeURIComponent(year)}&minReview=${encodeURIComponent(minReview)}`
  );

  const tbody = document.querySelector('#table-top-courses tbody');
  tbody.innerHTML = '';

  if (!ok && status === 501) {
    const tr = document.createElement('tr');
    tr.classList.add('placeholder-row');
    tr.innerHTML = `<td colspan="5">${data.message}</td>`;
    tbody.appendChild(tr);
    return;
  }

  if (!ok) {
    const tr = document.createElement('tr');
    tr.classList.add('placeholder-row');
    tr.innerHTML = `<td colspan="5">Lỗi tải dữ liệu.</td>`;
    tbody.appendChild(tr);
    return;
  }

  if (!data || data.length === 0) {
    const tr = document.createElement('tr');
    tr.classList.add('placeholder-row');
    tr.innerHTML = `<td colspan="5">Không có khóa học nào thỏa điều kiện.</td>`;
    tbody.appendChild(tr);
    return;
  }

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.Course_id}</td>
      <td>${row.Cour_name}</td>
      <td>${row[''] || row.TeacherName || ''}</td>
      <td>${row.Total_Reviews}</td>
      <td>${row.Avg_Rating}</td>
    `;
    tbody.appendChild(tr);
  });
});

// 2. Teacher dashboard
document.getElementById('form-teacher').addEventListener('submit', async (e) => {
  e.preventDefault();
  const teacherId = document.getElementById('teacherId').value.trim();
  if (!teacherId) return;

  // Rank
  const rankRes = await callApi(`/api/teacher/${encodeURIComponent(teacherId)}/rank`);
  const rankBox = document.getElementById('teacher-rank');

  if (!rankRes.ok && rankRes.status === 501) {
    rankBox.textContent = rankRes.data.message;
  } else if (!rankRes.ok) {
    rankBox.textContent = 'Lỗi tải dữ liệu.';
  } else {
    rankBox.textContent = rankRes.data.RankText || rankRes.data.Loyalty || JSON.stringify(rankRes.data);
  }

  // Course stats
  const statsRes = await callApi(`/api/teacher/${encodeURIComponent(teacherId)}/courses`);
  const tbody = document.querySelector('#table-teacher-courses tbody');
  tbody.innerHTML = '';

  if (!statsRes.ok && statsRes.status === 501) {
    const tr = document.createElement('tr');
    tr.classList.add('placeholder-row');
    tr.innerHTML = `<td colspan="6">${statsRes.data.message}</td>`;
    tbody.appendChild(tr);
    return;
  }

  if (!statsRes.ok) {
    const tr = document.createElement('tr');
    tr.classList.add('placeholder-row');
    tr.innerHTML = `<td colspan="6">Lỗi tải dữ liệu.</td>`;
    tbody.appendChild(tr);
    return;
  }

  const rows = statsRes.data;
  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    tr.classList.add('placeholder-row');
    tr.innerHTML = `<td colspan="6">Giảng viên chưa có khóa học hoặc không có dữ liệu.</td>`;
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.Course_id}</td>
      <td>${r.Cour_name}</td>
      <td>${r.NumFeedbacks ?? 0}</td>
      <td>${r.AvgRating ?? '-'}</td>
      <td>${r.NumRegisteredStudents ?? 0}</td>
      <td>${r.AvgFinalScore ?? '-'}</td>
    `;
    tbody.appendChild(tr);
  });
});

// 3. Student loyalty
document.getElementById('form-student').addEventListener('submit', async (e) => {
  e.preventDefault();
  const stuId = document.getElementById('stuId').value.trim();
  if (!stuId) return;

  const { ok, status, data } = await callApi(`/api/student/${encodeURIComponent(stuId)}/loyalty`);
  const box = document.getElementById('student-loyalty');

  if (!ok && status === 501) {
    box.textContent = data.message;
  } else if (!ok) {
    box.textContent = 'Lỗi tải dữ liệu.';
  } else {
    box.textContent = data.Loyalty || data.Rank || JSON.stringify(data);
  }
});

// 4. Feedback actions (Add / Update / Delete)
function getFeedbackPayload() {
  return {
    Stu_id: document.getElementById('fbStuId').value.trim(),
    Cour_id: document.getElementById('fbCourId').value.trim(),
    Rating: parseInt(document.getElementById('fbRating').value, 10),
    Comment: document.getElementById('fbComment').value.trim()
  };
}

function setFbStatus(text) {
  const fbStatus = document.getElementById('fb-status');
  if (fbStatus) {
    fbStatus.textContent = text;
  }
}

// Check if buttons exist before adding event listeners
const btnAddFb = document.getElementById('btnAddFb');
if (btnAddFb) {
  btnAddFb.addEventListener('click', async () => {
    const payload = getFeedbackPayload();

    const { ok, status, data } = await callApi('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!ok && status === 501) {
      setFbStatus(data.message);
    } else if (!ok) {
      setFbStatus(data.error || 'Lỗi thêm feedback.');
    } else {
      setFbStatus('Thêm feedback thành công (khi backend được hiện thực).');
    }
  });
}

const btnUpdateFb = document.getElementById('btnUpdateFb');
if (btnUpdateFb) {
  btnUpdateFb.addEventListener('click', async () => {
    const payload = getFeedbackPayload();

    const { ok, status, data } = await callApi('/api/feedback', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!ok && status === 501) {
      setFbStatus(data.message);
    } else if (!ok) {
      setFbStatus(data.error || 'Lỗi cập nhật feedback.');
    } else {
      setFbStatus('Cập nhật feedback thành công (khi backend được hiện thực).');
    }
  });
}

const btnDeleteFb = document.getElementById('btnDeleteFb');
if (btnDeleteFb) {
  btnDeleteFb.addEventListener('click', async () => {
    const Stu_id = document.getElementById('fbStuId').value.trim();
    const Cour_id = document.getElementById('fbCourId').value.trim();

    const { ok, status, data } = await callApi('/api/feedback', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Stu_id, Cour_id })
    });

    if (!ok && status === 501) {
      setFbStatus(data.message);
    } else if (!ok) {
      setFbStatus(data.error || 'Lỗi xóa feedback.');
    } else {
      setFbStatus('Xóa feedback thành công (khi backend được hiện thực).');
    }
  });
}
