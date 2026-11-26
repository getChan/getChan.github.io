const sectionLabels = {
  experience: 'Experience',
  presentations: 'Presentations',
  skills: 'Skills',
  education: 'Education',
};

const languages = {
  ko: {
    file: 'data.json',
    language: '이력서 언어',
    print: 'PDF로 저장',
    video: '발표 영상',
    error: '이력서를 불러오지 못했습니다. 페이지를 새로고침해 주세요.',
  },
  en: {
    file: 'data.en.json',
    language: 'Resume language',
    print: 'Save as PDF',
    video: 'Talk video',
    error: 'Could not load the resume. Please refresh the page.',
  },
  'zh-CN': {
    file: 'data.zh-CN.json',
    language: '简历语言',
    print: '保存为 PDF',
    video: '演讲视频',
    error: '无法加载简历，请刷新页面。',
    experience: '工作经历',
    presentations: '技术演讲',
    skills: '技能',
    education: '教育背景',
  },
};

function textElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function setLink(anchor, { label, url }) {
  anchor.textContent = label;
  anchor.href = url;
  return anchor;
}

function renderExperience(entry, presentations, videoLabel) {
  const article = document.getElementById('experience-entry').content.firstElementChild.cloneNode(true);
  const title = article.querySelector('h3');
  title.textContent = entry.company;
  if (entry.qualifier) {
    const qualifier = textElement('span', entry.qualifier);
    qualifier.className = 'qualifier';
    title.append(' ', qualifier);
  }
  article.querySelector('.date').textContent = entry.period;

  const list = document.createElement('ul');
  const highlights = entry.highlights?.length ? entry.highlights : [{ description: entry.description }];
  for (const { title, description, presentationId } of highlights) {
    const item = document.createElement('li');
    if (title) item.append(textElement('strong', title), ' ');
    item.append(description);

    const presentation = presentationId && presentations.find(talk => talk.id === presentationId);
    if (presentation) {
      const link = setLink(document.createElement('a'), { label: videoLabel, url: presentation.url });
      item.append(' ', link);
    }
    list.append(item);
  }
  article.append(list);
  return article;
}

function renderPresentation(entry) {
  const row = document.getElementById('presentation-entry').content.firstElementChild.cloneNode(true);
  setLink(row.querySelector('a'), entry);
  row.querySelector('.event').textContent = entry.event;
  return row;
}

const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
const language = Object.hasOwn(languages, requestedLanguage) ? requestedLanguage : 'ko';
const labels = { ...sectionLabels, ...languages[language] };

function renderResume(resume) {
  document.documentElement.lang = language;
  document.getElementById('languages').setAttribute('aria-label', labels.language);
  document.querySelector(`[data-language="${language}"]`).setAttribute('aria-current', 'page');
  for (const element of document.querySelectorAll('[data-label]')) {
    element.textContent = labels[element.dataset.label];
  }

  document.title = `${resume.name} | ${resume.role}`;
  for (const field of ['name', 'role']) {
    document.getElementById(field).textContent = resume[field];
  }

  const contactLinks = resume.contact.map(entry => setLink(document.createElement('a'), entry));
  document.getElementById('contact').replaceChildren(...contactLinks);
  const jobs = resume.experience.map(entry => renderExperience(entry, resume.presentations, labels.video));
  document.getElementById('experience').replaceChildren(...jobs);
  document.getElementById('presentations').replaceChildren(...resume.presentations.map(renderPresentation));

  const contributions = resume.contributions;
  document.getElementById('contributions').textContent = contributions.label;
  const ecosystemLink = setLink(document.createElement('a'), {
    label: contributions.ecosystem ?? contributions.summary,
    url: contributions.url,
  });
  document.getElementById('contributions-summary').replaceChildren(ecosystemLink);

  document.getElementById('skills').textContent = resume.skills.join(' · ');

  document.getElementById('school').textContent = resume.education.school;
  document.getElementById('degree').textContent = resume.education.degree;
  document.getElementById('education-period').textContent = resume.education.period;
}

async function loadResume() {
  const response = await fetch(labels.file);
  if (!response.ok) throw new Error(`Could not load resume data (${response.status})`);
  renderResume(await response.json());
  document.getElementById('print-resume').addEventListener('click', () => window.print());
  document.getElementById('resume').hidden = false;
}

loadResume().catch(error => {
  console.error(error);
  const message = document.getElementById('resume-error');
  document.documentElement.lang = language;
  message.textContent = labels.error;
  message.hidden = false;
});
