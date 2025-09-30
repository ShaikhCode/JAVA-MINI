let questions = [];

function postQuestion() {
  const input = document.getElementById('questionInput');
  const username = document.getElementById('username').value || 'Anonymous';
  const text = input.value.trim();

  if (!text) return;

  const question = {
    id: Date.now(),
    user: username,
    text,
    replies: []
  };

  questions.unshift(question);
  input.value = '';
  renderQuestions();
}

function postReply(questionId, replyInputId, username = 'Guest') {
  const input = document.getElementById(replyInputId);
  const text = input.value.trim();
  if (!text) return;

  const reply = {
    id: Date.now(),
    user: username,
    text,
    likes: 0
  };

  const question = questions.find(q => q.id === questionId);
  question.replies.push(reply);
  input.value = '';
  renderQuestions();
}

function likeReply(questionId, replyId) {
  const question = questions.find(q => q.id === questionId);
  const reply = question.replies.find(r => r.id === replyId);
  reply.likes++;
  renderQuestions();
}

function reportReply(questionId, replyId) {
  alert("Reported. Admin will review.");
  // Optionally: mark it flagged for admin
}

function renderQuestions() {
  const feed = document.getElementById('chat-feed');
  feed.innerHTML = '';

  questions.forEach(q => {
    const div = document.createElement('div');
    div.className = 'question-block';

    div.innerHTML = `
      <h3>${q.text}</h3>
      <p style="color:#aaa; margin-bottom: 10px;">Posted by @${q.user}</p>

      <div class="replies">
        ${q.replies
          .sort((a, b) => b.likes - a.likes)
          .map(r => `
            <div class="reply">
              <div class="meta">@${r.user}</div>
              ${r.text}
              <div>
                <button onclick="likeReply(${q.id}, ${r.id})"><i class="fa-regular fa-heart"></i> Like</button>
                <button onclick="reportReply(${q.id}, ${r.id})"><i class="fa-regular fa-ban"></i> Report</button>
                <span class="likes">${r.likes} likes</span>
              </div>
            </div>
          `).join('')}
      </div>

      <div class="reply-input">
        <input id="reply-${q.id}" placeholder="Reply to this question..." />
        <button onclick="postReply(${q.id}, 'reply-${q.id}', document.getElementById('username').value)"><i class="fa-light fa-reply"></i> Reply</button>
      </div>
    `;

    feed.appendChild(div);
  });
}
