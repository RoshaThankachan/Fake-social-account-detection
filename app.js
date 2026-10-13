/**
 * Fake Social Media Account Detection - Client Interactive Controller
 * Author: Rosha Thankachan
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State and Feature List
  const featuresList = [
    "has_profile_pic", "bio_length", "username_randomness", "followers", "following",
    "follower_following_ratio", "account_age_days", "posts", "posts_per_day",
    "caption_similarity_score", "content_similarity_score", "follow_unfollow_rate",
    "spam_comments_rate", "generic_comment_rate", "suspicious_links_in_bio",
    "verified", "username_length", "digits_count", "digit_ratio",
    "special_char_count", "repeat_char_count"
  ];

  // Presets
  const presets = {
    spambot: {
      username: "promo_deal_89420",
      has_profile_pic: 0,
      bio_length: 15,
      followers: 28,
      following: 1950,
      account_age_days: 14,
      posts: 180,
      posts_per_day: 12.8,
      caption_similarity_score: 0.92,
      content_similarity_score: 0.89,
      follow_unfollow_rate: 460,
      spam_comments_rate: 185,
      generic_comment_rate: 135,
      suspicious_links_in_bio: 1,
      verified: 0,
      username_randomness: 1
    },
    genuine: {
      username: "roshathankachan",
      has_profile_pic: 1,
      bio_length: 135,
      followers: 5200,
      following: 410,
      account_age_days: 2150,
      posts: 265,
      posts_per_day: 0.28,
      caption_similarity_score: 0.21,
      content_similarity_score: 0.24,
      follow_unfollow_rate: 18,
      spam_comments_rate: 4,
      generic_comment_rate: 22,
      suspicious_links_in_bio: 0,
      verified: 1,
      username_randomness: 0
    },
    lurker: {
      username: "crypto_gainz_992",
      has_profile_pic: 1,
      bio_length: 45,
      followers: 320,
      following: 1400,
      account_age_days: 90,
      posts: 42,
      posts_per_day: 1.8,
      caption_similarity_score: 0.74,
      content_similarity_score: 0.68,
      follow_unfollow_rate: 395,
      spam_comments_rate: 95,
      generic_comment_rate: 110,
      suspicious_links_in_bio: 1,
      verified: 0,
      username_randomness: 1
    },
    student: {
      username: "alex_miller_24",
      has_profile_pic: 1,
      bio_length: 78,
      followers: 430,
      following: 480,
      account_age_days: 1650,
      posts: 95,
      posts_per_day: 0.12,
      caption_similarity_score: 0.29,
      content_similarity_score: 0.31,
      follow_unfollow_rate: 35,
      spam_comments_rate: 8,
      generic_comment_rate: 40,
      suspicious_links_in_bio: 0,
      verified: 0,
      username_randomness: 0
    }
  };

  // DOM Elements
  const usernameInput = document.getElementById('input-username');
  const chipLength = document.getElementById('chip-length');
  const chipDigits = document.getElementById('chip-digits');
  const chipRatio = document.getElementById('chip-ratio');
  const chipSpecial = document.getElementById('chip-special');
  const chipRepeat = document.getElementById('chip-repeat');

  const verdictBadge = document.getElementById('verdict-badge');
  const gaugeBar = document.getElementById('gauge-bar');
  const gaugePct = document.getElementById('gauge-pct');
  const gaugeSubtext = document.getElementById('gauge-subtext');
  const riskFactorsList = document.getElementById('risk-factors-list');
  const fakeVoteFill = document.getElementById('fake-vote-fill');
  const voteFakeLbl = document.getElementById('vote-fake-lbl');
  const voteGenLbl = document.getElementById('vote-gen-lbl');

  // Sliders and inputs
  const sliders = document.querySelectorAll('.sync-slider');

  // Bind Slider Events
  sliders.forEach(slider => {
    const valDisplay = document.getElementById(`val-${slider.id.replace('slider-', '')}`);
    slider.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      if (valDisplay) {
        valDisplay.textContent = Number.isInteger(val) ? val : val.toFixed(2);
      }
      // If followers or following changed, update ratio
      if (slider.id === 'slider-followers' || slider.id === 'slider-following') {
        updateFollowerRatio();
      }
      runPrediction();
    });
  });

  // Toggles
  const toggles = document.querySelectorAll('.sync-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      runPrediction();
    });
  });

  // Username Input Event
  if (usernameInput) {
    usernameInput.addEventListener('input', (e) => {
      analyzeUsername(e.target.value);
      runPrediction();
    });
  }

  // Presets Buttons
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetKey = btn.dataset.preset;
      if (presets[presetKey]) {
        applyPreset(presets[presetKey]);
      }
    });
  });

  function updateFollowerRatio() {
    const followers = parseFloat(document.getElementById('slider-followers').value) || 0;
    const following = parseFloat(document.getElementById('slider-following').value) || 1;
    const ratio = followers / Math.max(following, 1);
    const ratioDisplay = document.getElementById('val-ratio');
    if (ratioDisplay) {
      ratioDisplay.textContent = ratio.toFixed(2);
    }
  }

  function analyzeUsername(uname) {
    const text = uname || '';
    const length = text.length;
    const digits = (text.match(/\d/g) || []).length;
    const ratio = length > 0 ? (digits / length) : 0;
    const special = (text.match(/[^a-zA-Z0-9]/g) || []).length;
    
    // Repeat characters (e.g. "aaa", "111")
    let repeats = 0;
    for (let i = 1; i < text.length; i++) {
      if (text[i] === text[i - 1]) repeats++;
    }

    if (chipLength) chipLength.innerHTML = `Len: <strong>${length}</strong>`;
    if (chipDigits) chipDigits.innerHTML = `Digits: <strong>${digits}</strong>`;
    if (chipRatio) {
      chipRatio.innerHTML = `Digit Ratio: <strong>${(ratio * 100).toFixed(0)}%</strong>`;
      chipRatio.classList.toggle('alert', ratio > 0.4);
    }
    if (chipSpecial) chipSpecial.innerHTML = `Special: <strong>${special}</strong>`;
    if (chipRepeat) chipRepeat.innerHTML = `Repeats: <strong>${repeats}</strong>`;

    return { length, digits, ratio, special, repeats };
  }

  function applyPreset(data) {
    if (data.username && usernameInput) {
      usernameInput.value = data.username;
      analyzeUsername(data.username);
    }

    // Set sliders
    Object.keys(data).forEach(key => {
      const slider = document.getElementById(`slider-${key}`);
      const valDisplay = document.getElementById(`val-${key}`);
      if (slider) {
        slider.value = data[key];
        if (valDisplay) {
          valDisplay.textContent = Number.isInteger(data[key]) ? data[key] : data[key].toFixed(2);
        }
      }
      const toggle = document.getElementById(`toggle-${key}`);
      if (toggle) {
        toggle.checked = data[key] === 1;
      }
    });

    updateFollowerRatio();
    runPrediction();
  }

  // Feature vector extractor
  function getCurrentFeatureVector() {
    const uname = usernameInput ? usernameInput.value : '';
    const uMeta = analyzeUsername(uname);

    const followers = parseFloat(document.getElementById('slider-followers').value) || 0;
    const following = parseFloat(document.getElementById('slider-following').value) || 1;
    const ratio = followers / Math.max(following, 1);

    const getToggleVal = id => document.getElementById(id)?.checked ? 1 : 0;
    const getSliderVal = id => parseFloat(document.getElementById(id)?.value) || 0;

    return {
      has_profile_pic: getToggleVal('toggle-has_profile_pic'),
      bio_length: getSliderVal('slider-bio_length'),
      username_randomness: getToggleVal('toggle-username_randomness'),
      followers: followers,
      following: following,
      follower_following_ratio: ratio,
      account_age_days: getSliderVal('slider-account_age_days'),
      posts: getSliderVal('slider-posts'),
      posts_per_day: getSliderVal('slider-posts_per_day'),
      caption_similarity_score: getSliderVal('slider-caption_similarity_score'),
      content_similarity_score: getSliderVal('slider-content_similarity_score'),
      follow_unfollow_rate: getSliderVal('slider-follow_unfollow_rate'),
      spam_comments_rate: getSliderVal('slider-spam_comments_rate'),
      generic_comment_rate: getSliderVal('slider-generic_comment_rate'),
      suspicious_links_in_bio: getToggleVal('toggle-suspicious_links_in_bio'),
      verified: getToggleVal('toggle-verified'),
      username_length: uMeta.length,
      digits_count: uMeta.digits,
      digit_ratio: uMeta.ratio,
      special_char_count: uMeta.special,
      repeat_char_count: uMeta.repeats
    };
  }

  // Pure Client Prediction Engine using exported Random Forest Trees
  function evaluateForest(featureDict) {
    // If trees are available in window.FOREST_MODEL_TREES
    if (window.FOREST_MODEL_TREES && Array.isArray(window.FOREST_MODEL_TREES) && window.FOREST_MODEL_TREES.length > 0) {
      const vector = featuresList.map(f => featureDict[f] ?? 0);
      const trees = window.FOREST_MODEL_TREES;
      let totalFakeProb = 0;

      for (let t = 0; t < trees.length; t++) {
        const tree = trees[t];
        let curr = 0;
        while (curr >= 0 && curr < tree.length) {
          const node = tree[curr];
          const featIdx = node[0];
          if (featIdx === -1) {
            // Leaf node: node[1] contains fake prob
            totalFakeProb += node[1];
            break;
          }
          const thresh = node[1];
          if (vector[featIdx] <= thresh) {
            curr = node[2]; // left child
          } else {
            curr = node[3]; // right child
          }
        }
      }
      return totalFakeProb / trees.length;
    }

    // Fallback: Weighted heuristic decision formula based on exact model feature importances
    let score = 0.35; // base prior
    if (featureDict.digit_ratio > 0.3) score += 0.25 * (featureDict.digit_ratio / 0.8);
    if (featureDict.digits_count >= 4) score += 0.18;
    if (featureDict.username_length > 12) score += 0.12;
    if (featureDict.suspicious_links_in_bio === 1) score += 0.15;
    if (featureDict.follow_unfollow_rate > 200) score += 0.14;
    if (featureDict.spam_comments_rate > 80) score += 0.12;
    if (featureDict.caption_similarity_score > 0.6) score += 0.10;
    if (featureDict.posts_per_day > 8) score += 0.10;
    if (featureDict.verified === 1) score -= 0.30;
    if (featureDict.has_profile_pic === 1) score -= 0.10;
    if (featureDict.account_age_days > 1000) score -= 0.15;
    return Math.max(0.01, Math.min(0.99, score));
  }

  function runPrediction() {
    const vec = getCurrentFeatureVector();
    const fakeProb = evaluateForest(vec);
    const genuineProb = 1 - fakeProb;
    const isFake = fakeProb >= 0.5;

    // Update Verdict Badge
    if (verdictBadge) {
      if (isFake) {
        verdictBadge.className = 'result-verdict-badge fake';
        verdictBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> SUSPICIOUS / FAKE`;
      } else {
        verdictBadge.className = 'result-verdict-badge genuine';
        verdictBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> CONFIRMED GENUINE`;
      }
    }

    // Update Circular Gauge
    // Circumference for r=70 is ~439.82
    const circumference = 439.82;
    const displayScore = isFake ? fakeProb : genuineProb;
    const pctInt = Math.round(displayScore * 100);
    const offset = circumference - (displayScore * circumference);

    if (gaugeBar) {
      gaugeBar.style.strokeDashoffset = offset;
      gaugeBar.style.stroke = isFake ? 'var(--color-fake)' : 'var(--color-genuine)';
    }

    if (gaugePct) {
      gaugePct.textContent = `${pctInt}%`;
    }

    if (gaugeSubtext) {
      gaugeSubtext.textContent = isFake ? 'Fake Probability' : 'Authenticity Confidence';
    }

    // Update Vote Progress Bar
    if (fakeVoteFill) {
      fakeVoteFill.style.width = `${Math.round(fakeProb * 100)}%`;
    }
    if (voteFakeLbl) voteFakeLbl.textContent = `Fake: ${(fakeProb * 100).toFixed(1)}%`;
    if (voteGenLbl) voteGenLbl.textContent = `Genuine: ${(genuineProb * 100).toFixed(1)}%`;

    // Dynamic Risk Factors List
    if (riskFactorsList) {
      riskFactorsList.innerHTML = '';
      const factors = [];

      if (vec.digit_ratio >= 0.35) {
        factors.push({
          type: 'danger',
          icon: 'fa-arrow-trend-up',
          text: `High username digit ratio (${(vec.digit_ratio * 100).toFixed(0)}%) matches synthetic bot naming conventions.`
        });
      } else if (vec.digit_ratio < 0.15 && vec.username_length > 4) {
        factors.push({
          type: 'safe',
          icon: 'fa-check',
          text: `Clean username morphology with natural alphabetical distribution.`
        });
      }

      if (vec.follow_unfollow_rate > 250) {
        factors.push({
          type: 'danger',
          icon: 'fa-user-group',
          text: `Elevated follow-unfollow churn rate (${vec.follow_unfollow_rate}/day) indicates aggressive growth farming.`
        });
      }

      if (vec.caption_similarity_score > 0.65 || vec.content_similarity_score > 0.65) {
        factors.push({
          type: 'danger',
          icon: 'fa-clone',
          text: `High duplicate content similarity score (${(vec.caption_similarity_score * 100).toFixed(0)}%) suggests script-automated posting.`
        });
      }

      if (vec.suspicious_links_in_bio === 1) {
        factors.push({
          type: 'danger',
          icon: 'fa-link',
          text: `Suspicious link presence in account biography.`
        });
      }

      if (vec.verified === 1) {
        factors.push({
          type: 'safe',
          icon: 'fa-badge-check',
          text: `Platform identity verification is active.`
        });
      }

      if (vec.account_age_days > 1200) {
        factors.push({
          type: 'safe',
          icon: 'fa-calendar-check',
          text: `Established account longevity (${Math.round(vec.account_age_days / 365)} years active).`
        });
      }

      if (vec.posts_per_day > 10) {
        factors.push({
          type: 'danger',
          icon: 'fa-bolt',
          text: `Abnormal posting frequency (${vec.posts_per_day.toFixed(1)} posts/day) exceeds typical human activity.`
        });
      }

      if (factors.length === 0) {
        factors.push({
          type: isFake ? 'danger' : 'safe',
          icon: isFake ? 'fa-circle-exclamation' : 'fa-check',
          text: isFake ? 'General behavioral patterns correlate with automated accounts.' : 'Standard behavioral and profile activity consistent with real users.'
        });
      }

      factors.slice(0, 4).forEach(f => {
        const li = document.createElement('li');
        li.className = `factor-item ${f.type}`;
        li.innerHTML = `<i class="fa-solid ${f.icon}"></i> <span>${f.text}</span>`;
        riskFactorsList.appendChild(li);
      });
    }
  }

  // 2. Sample Dataset Explorer Logic
  const sampleTableBody = document.getElementById('sample-table-body');
  const sampleSearchInput = document.getElementById('sample-search-input');
  const sampleFilterPills = document.querySelectorAll('.sample-filter-pill');

  let currentSamples = [];
  if (window.MODEL_METADATA && Array.isArray(window.MODEL_METADATA.sample_records)) {
    currentSamples = window.MODEL_METADATA.sample_records;
  }

  function renderSampleTable(filter = 'all', searchQuery = '') {
    if (!sampleTableBody) return;
    sampleTableBody.innerHTML = '';

    const filtered = currentSamples.filter(item => {
      if (filter === 'genuine' && item.is_fake_actual !== 0) return false;
      if (filter === 'fake' && item.is_fake_actual !== 1) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchUname = item.username.toLowerCase().includes(q);
        const matchPlatform = item.platform.toLowerCase().includes(q);
        const matchId = String(item.id).includes(q);
        return matchUname || matchPlatform || matchId;
      }
      return true;
    });

    if (filtered.length === 0) {
      sampleTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No accounts matched your search.</td></tr>`;
      return;
    }

    filtered.slice(0, 15).forEach(item => {
      const tr = document.createElement('tr');
      const isCorrect = item.is_fake_actual === item.is_fake_pred;
      const actualBadge = item.is_fake_actual === 1 
        ? `<span class="badge-tag fake"><i class="fa-solid fa-triangle-exclamation"></i> Fake</span>`
        : `<span class="badge-tag genuine"><i class="fa-solid fa-circle-check"></i> Genuine</span>`;
      const predBadge = item.is_fake_pred === 1 
        ? `<span class="badge-tag fake">Fake</span>`
        : `<span class="badge-tag genuine">Genuine</span>`;

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--accent-cyan);">#${item.id}</td>
        <td style="font-weight: 600;">@${item.username}</td>
        <td><i class="fa-brands fa-${item.platform.toLowerCase() === 'x' ? 'x-twitter' : item.platform.toLowerCase()}"></i> ${item.platform}</td>
        <td>${actualBadge}</td>
        <td>${predBadge}</td>
        <td style="font-family: var(--font-mono); color:${isCorrect ? '#34d399' : '#f87171'}">${(item.confidence * 100).toFixed(1)}%</td>
        <td>
          <button class="btn btn-secondary load-sample-btn" data-id="${item.id}" style="padding: 4px 10px; font-size: 0.75rem;">
            Test <i class="fa-solid fa-arrow-right"></i>
          </button>
        </td>
      `;
      sampleTableBody.appendChild(tr);
    });

    // Attach click handlers to load sample into predictor
    document.querySelectorAll('.load-sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const sample = currentSamples.find(s => s.id === id);
        if (sample && sample.features) {
          applyPreset({
            username: sample.username,
            ...sample.features
          });
          // Scroll to predictor
          document.getElementById('detector').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  if (sampleSearchInput) {
    sampleSearchInput.addEventListener('input', (e) => {
      const activePill = document.querySelector('.sample-filter-pill.active');
      const filter = activePill ? activePill.dataset.filter : 'all';
      renderSampleTable(filter, e.target.value);
    });
  }

  sampleFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sampleFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const query = sampleSearchInput ? sampleSearchInput.value : '';
      renderSampleTable(pill.dataset.filter, query);
    });
  });

  // 3. Image Modal Zoom
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');

  document.querySelectorAll('.viz-img-box').forEach(box => {
    box.addEventListener('click', () => {
      const img = box.querySelector('.viz-img');
      const title = box.closest('.viz-card')?.querySelector('.viz-title')?.textContent || 'Figure Preview';
      if (modal && modalImg && img) {
        modalImg.src = img.src;
        if (modalTitle) modalTitle.textContent = title;
        modal.classList.add('active');
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // 4. Citation / Clone Copy Button
  const copyBtn = document.getElementById('copy-clone-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = copyBtn.dataset.clipboard || 'git clone https://github.com/RoshaThankachan/fake-social-account-detection.git';
      navigator.clipboard.writeText(text).then(() => {
        const original = copyBtn.innerHTML;
        copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => copyBtn.innerHTML = original, 2000);
      });
    });
  }

  // Initial runs
  analyzeUsername('promo_deal_89420');
  updateFollowerRatio();
  runPrediction();
  renderSampleTable('all', '');
});
