let rooms = [];
let currentRoomIndex = 0;

const actions = {
  addRoomBtn: document.getElementById('addRoomBtn'),
  roomList: document.getElementById('roomList'),
  roomsContainer: document.getElementById('roomsContainer'),
  wallPrice: document.getElementById('wallPrice'),
  ceilingPrice: document.getElementById('ceilingPrice'),
  floorPrice: document.getElementById('floorPrice'),
  doorPrice: document.getElementById('doorPrice'),
  calculateBtn: document.getElementById('calculateBtn'),
  saveBtn: document.getElementById('saveBtn'),
  shareBtn: document.getElementById('shareBtn'),
  resetBtn: document.getElementById('resetBtn'),
  screenshotBtn: document.getElementById('screenshotBtn'),
  projectName: document.getElementById('projectName'),
  clientName: document.getElementById('clientName'),
  projectLocation: document.getElementById('projectLocation'),
  resultsSection: document.getElementById('resultsSection'),
  individualRoomResults: document.getElementById('individualRoomResults'),
  projectSummaryBox: document.getElementById('projectSummaryBox'),
  dateTimeStamp: document.getElementById('dateTimeStamp')
};

function createRoom(name = '') {
  return {
    id: Date.now() + Math.random(),
    roomName: name || '',
    length: '',
    width: '',
    height: '',
    acousticDoors: '',
    deductions: []
  };
}

function renderRoomTabs() {
  actions.roomList.innerHTML = '';
  rooms.forEach((room, idx) => {
    const li = document.createElement('li');
    li.textContent = room.roomName || `Room ${idx + 1}`;
    li.classList.toggle('active', idx === currentRoomIndex);
    li.onclick = () => {
      currentRoomIndex = idx;
      renderRoomTabs(); renderRoomForm();
    };
    actions.roomList.appendChild(li);
  });
}

function renderRoomForm() {
  actions.roomsContainer.innerHTML = '';
  if (!rooms[currentRoomIndex]) return;
  const room = rooms[currentRoomIndex];

  const form = document.createElement('form');
  form.classList.add('roomForm');

  form.innerHTML = `
    <label>Room Name
      <input type="text" value="${room.roomName}" name="roomName" />
    </label>
    <label>Length (ft)
      <input type="number" min="0" step="0.01" value="${room.length}" name="length" />
    </label>
    <label>Width (ft)
      <input type="number" min="0" step="0.01" value="${room.width}" name="width" />
    </label>
    <label>Height (ft)
      <input type="number" min="0" step="0.01" value="${room.height}" name="height" />
    </label>
    <label>Acoustic Doors
      <input type="number" min="0" step="1" value="${room.acousticDoors}" name="acousticDoors" />
    </label>
    <div class="deductions-section">
      <b>Openings/Deductions</b>
      <div id="deductionRows"></div>
      <button type="button" class="add-deduction-btn">+ Add Deduction</button>
    </div>
    <button type="button" class="remove-room-btn" style="margin-top:0.9em;color:#fff; background:#d7281f;">Remove Room</button>
  `;
  actions.roomsContainer.appendChild(form);

  renderDeductionRows(form.querySelector('#deductionRows'), room);

  form.querySelectorAll('input[name]').forEach(inp => {
    inp.addEventListener('input', (e) => {
      room[inp.name] = inp.type === 'number' ? Number(inp.value) : inp.value;
      renderRoomTabs();
    });
  });

  form.querySelector('.add-deduction-btn').onclick = () => {
    room.deductions.push({ name: '', length: '', height: '' });
    renderRoomForm();
  };

  form.querySelector('.remove-room-btn').onclick = () => {
    if (rooms.length > 1) {
      rooms.splice(currentRoomIndex, 1);
      currentRoomIndex = Math.max(0, currentRoomIndex - 1);
      renderRoomTabs(); renderRoomForm(); renderResults();
    } else {
      alert("Cannot remove the only room.");
    }
  };
}

function renderDeductionRows(container, room) {
  container.innerHTML = '';
  room.deductions.forEach((ded, di) => {
    const row = document.createElement('div');
    row.classList.add('deduction-row');
    row.innerHTML = `
      <input type="text" placeholder="Name" value="${ded.name}" />
      <input type="number" min="0" step="0.01" placeholder="Length(ft)" value="${ded.length}" />
      <input type="number" min="0" step="0.01" placeholder="Height(ft)" value="${ded.height}" />
      <button type="button" class="remove-deduction-btn">−</button>
    `;
    row.children[0].oninput = (e) => { ded.name = e.target.value; };
    row.children[1].oninput = (e) => { ded.length = Number(e.target.value); };
    row.children[2].oninput = (e) => { ded.height = Number(e.target.value); };
    row.children[3].onclick = () => {
      room.deductions.splice(di, 1);
      renderRoomForm();
    };
    container.appendChild(row);
  });
}

actions.addRoomBtn.onclick = () => {
  rooms.push(createRoom());
  currentRoomIndex = rooms.length - 1;
  renderRoomTabs();
  renderRoomForm();
};

actions.calculateBtn.onclick = function() {
  renderResults();
  updateStamp();
};

function sum(arr) { return arr.reduce((a,b) => a + b, 0); }

function renderResults() {
  actions.individualRoomResults.innerHTML = '';
  let totalWall = 0, totalDed = 0, totalCeil = 0, totalFloor = 0;
  let totalWallPrice = 0, totalCeilPrice = 0, totalFloorPrice = 0, totalDoorPrice = 0;
  let totalDoors = 0;

  rooms.forEach((r, idx) => {
    let w1 = r.length * r.height;
    let w2 = r.length * r.height;
    let w3 = r.width * r.height;
    let w4 = r.width * r.height;
    let grossWall = w1 + w2 + w3 + w4;

    let dedTotal = sum(r.deductions.map(d => (d.length || 0) * (d.height || 0)));
    let netWall = Math.max(0, grossWall - dedTotal);

    let ceilArea = r.length * r.width;
    let floorArea = r.length * r.width;

    let doors = r.acousticDoors || 0;
    let wp = actions.wallPrice.valueAsNumber || 0;
    let cp = actions.ceilingPrice.valueAsNumber || 0;
    let fp = actions.floorPrice.valueAsNumber || 0;
    let dp = actions.doorPrice.valueAsNumber || 0;

    let wallPrice = wp ? netWall * wp : null;
    let ceilPrice = cp ? ceilArea * cp : null;
    let floorPrice = fp ? floorArea * fp : null;
    let doorPrice = dp ? doors * dp : null;
    let totalRoomCost = [wallPrice, ceilPrice, floorPrice, doorPrice]
      .map(x=>x||0).reduce((a, b) => a+b, 0);

    totalWall += netWall;
    totalDed += dedTotal;
    totalCeil += ceilArea;
    totalFloor += floorArea;
    totalDoors += doors;
    totalWallPrice += wallPrice || 0;
    totalCeilPrice += ceilPrice || 0;
    totalFloorPrice += floorPrice || 0;
    totalDoorPrice += doorPrice || 0;

    const box = document.createElement('div');
    box.className = 'room-summary-box';
    box.innerHTML = `
      <div class="summary-title">${r.roomName||"Room " + (idx+1)}</div>
      <div class="summary-section">
        Wall 1: ${r.length} ft x ${r.height} ft = ${(w1).toFixed(2)} sq ft<br>
        Wall 2: ${r.length} ft x ${r.height} ft = ${(w2).toFixed(2)} sq ft<br>
        Wall 3: ${r.width} ft x ${r.height} ft = ${(w3).toFixed(2)} sq ft<br>
        Wall 4: ${r.width} ft x ${r.height} ft = ${(w4).toFixed(2)} sq ft<br>
        <b>Gross Wall Area:</b> ${grossWall.toFixed(2)} sq ft<br>
        <b>Deductions:</b> ${dedTotal.toFixed(2)} sq ft
        ${r.deductions.length ? "<br>"+r.deductions.map((d, j) => `&nbsp;&nbsp;${d.name ? d.name : "Opening "+(j+1)}: ${d.length} ft x ${d.height} ft = ${(d.length*d.height).toFixed(2)} sq ft`).join("<br>") : ""}
        <br><b>Net Wall Area:</b> ${netWall.toFixed(2)} sq ft
      </div>
      <div class="summary-section"><b>Ceiling:</b> ${ceilArea.toFixed(2)} sq ft</div>
      <div class="summary-section"><b>Floor:</b> ${floorArea.toFixed(2)} sq ft</div>
      <div class="summary-section"><b>Doors:</b> ${doors}</div>
      <div class="price-section">
        Price for Wall Area: ${displayINR(wallPrice, netWall)}<br>
        Price for Ceiling: ${displayINR(ceilPrice, ceilArea)}<br>
        Price for Floor: ${displayINR(floorPrice, floorArea)}<br>
        Price for Acoustic Door: ${displayINR(doorPrice, doors)}<br>
        <span class="total">Room Total: ${displayINR(totalRoomCost)}</span>
      </div>
    `;
    actions.individualRoomResults.appendChild(box);
  });

  const projBox = document.createElement('div');
  projBox.className = 'project-summary-box';
  let projTotal = totalWallPrice + totalCeilPrice + totalFloorPrice + totalDoorPrice;
  projBox.innerHTML = `
    <div class="summary-title">${actions.projectName.value||'Project'}: Overall Total</div>
    <div class="summary-section">
      <b>Total Net Wall Areas:</b> ${totalWall.toFixed(2)} sq ft<br>
      <b>Total Ceiling Areas:</b> ${totalCeil.toFixed(2)} sq ft<br>
      <b>Total Floor Areas:</b> ${totalFloor.toFixed(2)} sq ft<br>
      <b>Total Doors:</b> ${totalDoors}
    </div>
    <div class="price-section">
      Price for Net Wall Area: ${displayINR(totalWallPrice, totalWall)}<br>
      Price for Ceiling: ${displayINR(totalCeilPrice, totalCeil)}<br>
      Price for Floor: ${displayINR(totalFloorPrice, totalFloor)}<br>
      Price for Doors: ${displayINR(totalDoorPrice, totalDoors)}<br>
      <span class="total">Total Project Cost: ${displayINR(projTotal)}</span>
    </div>
    <div><em>Created with DIGICAL by Digi Acoustics.</em></div>
    <div style="font-size:0.97em">${getFormattedStamp()}</div>
  `;
  actions.projectSummaryBox.innerHTML = '';
  actions.projectSummaryBox.appendChild(projBox);
}

function displayINR(amount, qty) {
  if (amount == null || amount == 0) return 'N/A';
  const x = Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `₹${x}${(qty !== undefined && qty !== null && qty !== 0) ? (" ("+qty+" sq ft)") : ""}`;
}

actions.saveBtn.onclick = () => {
  const saveData = {
    rooms: JSON.parse(JSON.stringify(rooms)),
    projectName: actions.projectName.value,
    clientName: actions.clientName.value,
    projectLocation: actions.projectLocation.value,
    wallPrice: actions.wallPrice.value,
    ceilingPrice: actions.ceilingPrice.value,
    floorPrice: actions.floorPrice.value,
    doorPrice: actions.doorPrice.value
  };
  if (!actions.projectName.value) return alert('Enter a project name.');
  localStorage.setItem('DIGICAL_' + actions.projectName.value, JSON.stringify(saveData));
  alert("Project Saved!");
};

function loadProjectData(name) {
  const data = JSON.parse(localStorage.getItem('DIGICAL_' + name));
  if (!data) return;
  rooms = data.rooms;
  actions.projectName.value = data.projectName;
  actions.clientName.value = data.clientName;
  actions.projectLocation.value = data.projectLocation;
  actions.wallPrice.value = data.wallPrice;
  actions.ceilingPrice.value = data.ceilingPrice;
  actions.floorPrice.value = data.floorPrice;
  actions.doorPrice.value = data.doorPrice;
  renderRoomTabs(); renderRoomForm(); renderResults();
}

// --- FULL DETAILED SHARE ---
actions.shareBtn.onclick = async () => {
  let report = `Project: ${actions.projectName.value || "Untitled Project"}\nClient: ${actions.clientName.value || "-"}\nLocation: ${actions.projectLocation.value || "-"}\n\n`;
  rooms.forEach((r, idx) => {
    let w1 = r.length * r.height, w2 = r.length * r.height;
    let w3 = r.width * r.height, w4 = r.width * r.height;
    let grossWall = w1 + w2 + w3 + w4;
    let dedTotal = sum(r.deductions.map(d => (d.length || 0) * (d.height || 0)));
    let netWall = Math.max(0, grossWall - dedTotal);
    let ceilArea = r.length * r.width;
    let floorArea = r.length * r.width;
    let doors = r.acousticDoors || 0;
    let wp = actions.wallPrice.valueAsNumber || 0, cp = actions.ceilingPrice.valueAsNumber || 0, fp = actions.floorPrice.valueAsNumber || 0, dp = actions.doorPrice.valueAsNumber || 0;
    let wallPrice = wp ? netWall * wp : null;
    let ceilPrice = cp ? ceilArea * cp : null;
    let floorPrice = fp ? floorArea * fp : null;
    let doorPrice = dp ? doors * dp : null;
    let totalRoomCost = [wallPrice, ceilPrice, floorPrice, doorPrice].map(x=>x||0).reduce((a, b) => a+b, 0);

    report += `--- Room ${idx+1}: ${r.roomName || "(unnamed)"} ---\n`;
    report += `  Wall 1: ${r.length} ft x ${r.height} ft = ${(w1).toFixed(2)} sq ft\n`;
    report += `  Wall 2: ${r.length} ft x ${r.height} ft = ${(w2).toFixed(2)} sq ft\n`;
    report += `  Wall 3: ${r.width} ft x ${r.height} ft = ${(w3).toFixed(2)} sq ft\n`;
    report += `  Wall 4: ${r.width} ft x ${r.height} ft = ${(w4).toFixed(2)} sq ft\n`;
    report += `  Gross Wall Area: ${grossWall.toFixed(2)} sq ft\n`;
    if (r.deductions.length) {
      report += `  Deductions:\n`;
      r.deductions.forEach((d, j) => {
        report += `    ${d.name ? d.name : "Opening"}: ${d.length} ft x ${d.height} ft = ${(d.length*d.height).toFixed(2)} sq ft\n`;
      });
    }
    report += `  Total Deductions: ${dedTotal.toFixed(2)} sq ft\n`;
    report += `  Net Wall Area: ${netWall.toFixed(2)} sq ft\n`;
    report += `  Ceiling: ${ceilArea.toFixed(2)} sq ft\n`;
    report += `  Flooring: ${floorArea.toFixed(2)} sq ft\n`;
    report += `  Acoustic Doors: ${doors}\n`;
    report += `  Wall Area Price: ${displayINR(wallPrice, netWall)}\n`;
    report += `  Ceiling Price: ${displayINR(ceilPrice, ceilArea)}\n`;
    report += `  Floor Price: ${displayINR(floorPrice, floorArea)}\n`;
    report += `  Door(s) Price: ${displayINR(doorPrice, doors)}\n`;
    report += `  Room Total: ${displayINR(totalRoomCost)}\n\n`;
  });

  let totalWall = 0, totalDed = 0, totalCeil = 0, totalFloor = 0, totalDoors = 0;
  let totalWallPrice = 0, totalCeilPrice = 0, totalFloorPrice = 0, totalDoorPrice = 0;
  rooms.forEach((r) => {
    let grossWall = r.length * r.height * 2 + r.width * r.height * 2;
    let dedTotal = sum(r.deductions.map(d => (d.length || 0) * (d.height || 0)));
    let netWall = Math.max(0, grossWall - dedTotal);
    let ceilArea = r.length * r.width;
    let floorArea = r.length * r.width;
    let doors = r.acousticDoors || 0;
    let wp = actions.wallPrice.valueAsNumber || 0, cp = actions.ceilingPrice.valueAsNumber || 0, fp = actions.floorPrice.valueAsNumber || 0, dp = actions.doorPrice.valueAsNumber || 0;
    let wallPrice = wp ? netWall * wp : null;
    let ceilPrice = cp ? ceilArea * cp : null;
    let floorPrice = fp ? floorArea * fp : null;
    let doorPrice = dp ? doors * dp : null;
    totalWall += netWall;
    totalDed += dedTotal;
    totalCeil += ceilArea;
    totalFloor += floorArea;
    totalDoors += doors;
    totalWallPrice += wallPrice || 0;
    totalCeilPrice += ceilPrice || 0;
    totalFloorPrice += floorPrice || 0;
    totalDoorPrice += doorPrice || 0;
  });
  let projTotal = totalWallPrice + totalCeilPrice + totalFloorPrice + totalDoorPrice;

  report += `=== PROJECT TOTALS ===\n`;
  report += `All Rooms - Net Wall Area: ${totalWall.toFixed(2)} sq ft\n`;
  report += `All Rooms - Ceiling: ${totalCeil.toFixed(2)} sq ft\n`;
  report += `All Rooms - Flooring: ${totalFloor.toFixed(2)} sq ft\n`;
  report += `All Rooms - Doors: ${totalDoors}\n`;
  report += `Total Wall Price: ${displayINR(totalWallPrice, totalWall)}\n`;
  report += `Total Ceiling Price: ${displayINR(totalCeilPrice, totalCeil)}\n`;
  report += `Total Floor Price: ${displayINR(totalFloorPrice, totalFloor)}\n`;
  report += `Total Door Price: ${displayINR(totalDoorPrice, totalDoors)}\n`;
  report += `Total Project Cost: ${displayINR(projTotal)}\n\n`;
  report += `Created with DIGICAL by Digi Acoustics.\n${getFormattedStamp()}`;

  try {
    await navigator.clipboard.writeText(report);
    alert("Detailed result copied to clipboard!");
  } catch (err) {
    alert("Copy not supported. Please copy manually.");
  }
};

actions.resetBtn.onclick = () => {
  if (!confirm("Clear all inputs and results?")) return;
  rooms = [createRoom()];
  currentRoomIndex = 0;
  actions.projectName.value = '';
  actions.clientName.value = '';
  actions.projectLocation.value = '';
  actions.wallPrice.value = '';
  actions.ceilingPrice.value = '';
  actions.floorPrice.value = '';
  actions.doorPrice.value = '';
  renderRoomTabs(); renderRoomForm(); renderResults();
};

actions.screenshotBtn.onclick = () => {
  html2canvas(actions.resultsSection, {useCORS:true, scale:2}).then(canvas => {
    const ts = getFormattedStamp(true);
    const pn = actions.projectName.value || 'project';
    const filename = `${pn.trim().replace(/[^a-z0-9]/gi,'_')}_${ts}.png`;
    let link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
    alert("Screenshot saved!\nFile: " + filename);
  });
};

function getFormattedStamp(fileSafe) {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth()+1).toString().padStart(2,'0');
  const d = now.getDate().toString().padStart(2,'0');
  const hh = now.getHours().toString().padStart(2,'0');
  const mm = now.getMinutes().toString().padStart(2,'0');
  const ss = now.getSeconds().toString().padStart(2,'0');
  return fileSafe ? `${y}${m}${d}_${hh}${mm}${ss}` : `${hh}:${mm}:${ss} ${d}-${m}-${y}`;
}
function updateStamp() {
  actions.dateTimeStamp.textContent = "Date/Time: " + getFormattedStamp(false);
}

(function init() {
  rooms = [createRoom()];
  renderRoomTabs();
  renderRoomForm();
  renderResults();
  updateStamp();
})();
