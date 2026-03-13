const app = document.querySelector('#app');

async function loadCourses() {
  const response = await fetch('/api/courses');
  if (!response.ok) {
    throw new Error(`Failed to load courses: ${response.status}`);
  }

  return response.json();
}

function renderCourses(courses) {
  const items = courses.map((course) => {
    return `
      <li class="card">
        <h2>${course.name}</h2>
        <p>${course.description}</p>
        <p><strong>Status:</strong> ${course.status}</p>
        <p><strong>Target date:</strong> ${course.target_date}</p>
      </li>
    `;
  }).join('');

  app.innerHTML = `
    <main>
      <img src="/javascript.svg" class="logo vanilla" alt="JavaScript logo" />
      <img src="/vite.svg" class="logo" alt="Vite logo" />
      <h1>CodeCraftHub</h1>
      <p class="read-the-docs">Your API is running and the frontend can reach it.</p>
      <ul class="course-list">
        ${items || '<li class="card">No courses found yet.</li>'}
      </ul>
    </main>
  `;
}

function renderError(error) {
  app.innerHTML = `
    <main>
      <h1>CodeCraftHub</h1>
      <p class="read-the-docs">The page loaded, but the API request failed.</p>
      <pre>${error.message}</pre>
    </main>
  `;
}

loadCourses()
  .then(renderCourses)
  .catch(renderError);
