// -----------------------------
// Q&A CHAT FRONTEND LOGIC
// -----------------------------

let u_id;
let u_name;
let communityId = 1; // default (you can set based on URL, see below)
const API_URL = "/api/chat";

// ---------- Utility ----------
function qs(sel) {
  return document.querySelector(sel);
}

// ---------- Init ----------
window.addEventListener("DOMContentLoaded", async () => {
  const loggedUser = localStorage.getItem("loggedInUser");
  if (loggedUser) {
    const user = JSON.parse(loggedUser);
    u_id = user.id;
    u_name = user.name;
    console.log("Logged in as:", u_name);
  }

  // 🔍 Detect community from URL ?community=java
  const params = new URLSearchParams(window.location.search);
  const commName = params.get("community");
  if (commName === "python") communityId = 2;
  if (commName === "java") communityId = 1;

  // Hide username input if logged in
  if (u_name) {
    qs("#username").style.display = "none";
  } else {
    qs("#username").value = "Anonymous";
  }

  await loadQuestions();
});

// ---------- Load Questions ----------
async function loadQuestions() {
  try {
    const res = await fetch(`${API_URL}/${communityId}`);
    let questions = await res.json();

    // ✅ Sort: Newest first (by id or createdAt)
    questions.sort((a, b) => b.id - a.id); // or use b.createdAt - a.createdAt if available

    const questionsWithNames = await Promise.all(
      questions.map(async (q) => {
        const nameRes = await fetch("/api/getName", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: q.userId }),
        });
        const nameData = await nameRes.json();

        const repliesWithNames = await Promise.all(
          (q.replies || []).map(async (reply) => {
            const replyNameRes = await fetch("/api/getName", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: reply.userId }),
            });
            const replyNameData = await replyNameRes.json();
            return {
              ...reply,
              name: replyNameData.name,
            };
          })
        );

        return {
          ...q,
          name: nameData.name,
          replies: repliesWithNames,
        };
      })
    );

    renderQuestions(questionsWithNames);
  } catch (err) {
    console.error("Error loading questions:", err);
  }
}


// ---------- Post Question ----------
async function postQuestion() {
  const input = document.getElementById("questionInput");
  const text = input.value.trim();
  const usernameInput = document.getElementById("username");
  const username = u_name || usernameInput.value.trim() || "Anonymous";

  if (!text) return alert("Please enter a question.");

  try {
    const payload = {
      userId: u_id || 0,
      communityId,
      questionText: text,
    };

    const res = await fetch(`${API_URL}/question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      input.value = "";
      await loadQuestions();
    } else {
      alert("Failed to post question.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error while posting question.");
  }
}

// ---------- Post Reply ----------
async function postReply(questionId, replyInputId) {
  const input = document.getElementById(replyInputId);
  const text = input.value.trim();
  if (!text) return alert("Reply cannot be empty.");

  try {
    const payload = {
      userId: u_id || 0,
      questionId,
      replyText: text,
    };

    const res = await fetch(`${API_URL}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      input.value = "";
      await loadQuestions();
    } else {
      alert("Failed to post reply.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error while posting reply.");
  }
}

// ---------- Like Reply ----------
async function likeReply(replyId) {
  try {
    const res = await fetch(`${API_URL}/like/${replyId}`, { method: "POST" });
    if (res.ok) {
      await loadQuestions();
    } else {
      alert("Failed to like reply.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error while liking reply.");
  }
}

// ---------- Report Reply ----------
function reportReply(replyId) {
  alert("⚠️ This reply has been reported for review.");
  // optional: send to backend for moderation
}

// ---------- Render Questions ----------
function renderQuestions(questions) {
  const feed = document.getElementById("chat-feed");
  feed.innerHTML = "";

  if (!questions.length) {
    feed.innerHTML = "<p>No questions yet. Be the first to ask!</p>";
    return;
  }

  questions.forEach((q) => {
    const div = document.createElement("div");
    div.className = "question-block";

    div.innerHTML = `
      <h3>${q.questionText}</h3>
      <p style="color:#aaa; margin-bottom: 10px;">Posted by ${q.name || "User#" + q.userId}</p>

      <div class="replies">
        ${(q.replies || [])
          .sort((a, b) => b.likes - a.likes)
          .map(
            (r) => `
            <div class="reply">
              <div class="meta">@${r.name || "User" + r.userId}</div>
              <p>${r.replyText}</p>
              <div class="reply-actions">
                <button onclick="likeReply(${r.id})">
                  <i class="fa-regular fa-heart"></i> Like (${r.likes})
                </button>
                <button onclick="reportReply(${r.id})">
                  <i class="fa-regular fa-flag"></i> Report
                </button>
              </div>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="reply-input">
        <input id="reply-${q.id}" placeholder="Reply to this question..." />
        <button onclick="postReply(${q.id}, 'reply-${q.id}')">
          <i class="fa-light fa-reply"></i> Reply
        </button>
      </div>
    `;

    feed.appendChild(div);
  });
}
