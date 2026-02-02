/**
 * Interactive Charts for "The Economics of Solo Entrepreneurship" article
 * Uses Chart.js for visualizations
 */

// =============================================================================
// Graph 1: Cost Structure Comparison
// =============================================================================
function initCostStructureChart() {
  const ctx = document.getElementById('costStructureChart');
  if (!ctx) return;

  const months = Array.from({ length: 25 }, (_, i) => i);

  // Traditional team costs (5 people)
  const teamCosts = months.map(m => {
    const salaryCost = (550000 / 12) * m; // $550k annual
    return salaryCost;
  });

  // Solo + AI costs
  const soloCosts = months.map(m => {
    const monthlyCost = 100000 / 12; // $100k annual
    return monthlyCost * m;
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Traditional Team (5 people)',
          data: teamCosts,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          fill: true
        },
        {
          label: 'Solo + AI',
          data: soloCosts,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        title: {
          display: true,
          text: 'Cumulative Burn Rate: Team vs. Solo',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': $' +
                     context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Months Since Founding'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cumulative Costs ($)'
          },
          ticks: {
            callback: function(value) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
          }
        }
      }
    }
  });
}

// =============================================================================
// Graph 2: Time to $1M ARR Calculator
// =============================================================================
function initTimeToARRChart() {
  console.log('Attempting to initialize Time to ARR Chart...');
  console.log('Looking for elements:', {
    ctx: 'timeToARRChart',
    growthRate: 'growthRate',
    startingCustomers: 'startingCustomers',
    arpu: 'arpu',
    results: 'arrResults'
  });

  const ctx = document.getElementById('timeToARRChart');
  const growthRateInput = document.getElementById('growthRate');
  const startingCustomersInput = document.getElementById('startingCustomers');
  const arpuInput = document.getElementById('arpu');
  const resultsDiv = document.getElementById('arrResults');

  console.log('Found elements:', {
    ctx: !!ctx,
    growthRate: !!growthRateInput,
    startingCustomers: !!startingCustomersInput,
    arpu: !!arpuInput,
    results: !!resultsDiv
  });

  if (!ctx) {
    console.error('Missing canvas element: timeToARRChart');
    return;
  }
  if (!growthRateInput) {
    console.error('Missing input element: growthRate');
    return;
  }
  if (!startingCustomersInput) {
    console.error('Missing input element: startingCustomers');
    console.log('All elements with "starting" in id:',
      Array.from(document.querySelectorAll('[id*="starting"]')).map(el => el.id));
    return;
  }
  if (!arpuInput) {
    console.error('Missing input element: arpu');
    return;
  }
  if (!resultsDiv) {
    console.error('Missing results div: arrResults');
    return;
  }

  let chart = null;

  function calculateARR(customers, monthlyGrowth, arpu, isSolo) {
    const months = [];
    const arr = [];
    const buildTime = isSolo ? 3 : 6; // MVP build time
    const burnRate = isSolo ? 8333 : 45833; // Monthly burn

    let currentCustomers = customers;
    let currentMonth = buildTime;

    // Building phase
    for (let i = 0; i <= buildTime; i++) {
      months.push(i);
      arr.push(0);
    }

    // Growth phase
    while (currentCustomers * arpu < 1000000 && currentMonth < 36) {
      currentMonth++;
      currentCustomers *= (1 + monthlyGrowth);
      months.push(currentMonth);
      arr.push(currentCustomers * arpu);
    }

    // Calculate total capital required
    const totalCapital = burnRate * currentMonth;

    return { months, arr, monthsTo1M: currentMonth, totalCapital };
  }

  function updateChart() {
    const growthRate = parseFloat(growthRateInput.value) / 100;
    const startingCustomers = parseInt(startingCustomersInput.value);
    const arpu = parseFloat(arpuInput.value);

    console.log('Updating chart with:', { growthRate, startingCustomers, arpu });

    const teamData = calculateARR(startingCustomers, growthRate, arpu, false);
    const soloData = calculateARR(startingCustomers, growthRate, arpu, true);

    console.log('Team data:', teamData);
    console.log('Solo data:', soloData);

    // Update results text
    resultsDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.03); border-radius: 8px;">
        <div>
          <strong style="color: rgb(239, 68, 68);">Traditional Team:</strong><br>
          Time to $1M ARR: <strong>${teamData.monthsTo1M} months</strong><br>
          Capital required: <strong>$${(teamData.totalCapital / 1000).toFixed(0)}K</strong>
        </div>
        <div>
          <strong style="color: rgb(34, 197, 94);">Solo + AI:</strong><br>
          Time to $1M ARR: <strong>${soloData.monthsTo1M} months</strong><br>
          Capital required: <strong>$${(soloData.totalCapital / 1000).toFixed(0)}K</strong>
        </div>
      </div>
    `;

    if (chart) {
      chart.destroy();
    }

    // Use the longer dataset for x-axis labels
    const maxMonths = Math.max(teamData.months.length, soloData.months.length);
    const allMonths = Array.from({ length: maxMonths }, (_, i) => i);

    // Pad shorter dataset with nulls
    const teamARRData = teamData.months.map((m, i) => ({ x: m, y: teamData.arr[i] }));
    const soloARRData = soloData.months.map((m, i) => ({ x: m, y: soloData.arr[i] }));

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allMonths,
        datasets: [
          {
            label: 'Traditional Team',
            data: teamARRData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.1,
            fill: true
          },
          {
            label: 'Solo + AI',
            data: soloARRData,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: 'Path to $1M ARR',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months Since Founding'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Annual Recurring Revenue ($)'
            },
            ticks: {
              callback: function(value) {
                return '$' + (value / 1000).toFixed(0) + 'K';
              }
            }
          }
        }
      }
    });
  }

  // Event listeners
  growthRateInput.addEventListener('input', function(e) {
    document.getElementById('growthRateValue').textContent = e.target.value + '%';
    updateChart();
  });

  startingCustomersInput.addEventListener('input', function(e) {
    document.getElementById('startingCustomersValue').textContent = e.target.value;
    updateChart();
  });

  arpuInput.addEventListener('input', function(e) {
    document.getElementById('arpuValue').textContent = '$' + parseFloat(e.target.value).toLocaleString();
    updateChart();
  });

  // Initial render
  updateChart();
}

// =============================================================================
// Graph 3: Unit Economics Calculator
// =============================================================================
function initUnitEconomicsCalc() {
  console.log('Attempting to initialize Unit Economics Calculator...');

  const arpuInput = document.getElementById('ueArpu');
  const cacInput = document.getElementById('ueCac');
  const churnInput = document.getElementById('ueChurn');
  const resultsDiv = document.getElementById('ueResults');

  console.log('Found elements:', {
    ueArpu: !!arpuInput,
    ueCac: !!cacInput,
    ueChurn: !!churnInput,
    ueResults: !!resultsDiv
  });

  if (!arpuInput) {
    console.error('Missing input element: ueArpu');
    return;
  }
  if (!cacInput) {
    console.error('Missing input element: ueCac');
    console.log('All elements with "ue" in id:',
      Array.from(document.querySelectorAll('[id*="ue"]')).map(el => el.id));
    return;
  }
  if (!churnInput) {
    console.error('Missing input element: ueChurn');
    return;
  }
  if (!resultsDiv) {
    console.error('Missing results div: ueResults');
    return;
  }

  function calculate() {
    const arpu = parseFloat(arpuInput.value);
    const cac = parseFloat(cacInput.value);
    const churnRate = parseFloat(churnInput.value) / 100;

    // Calculate metrics
    const avgLifetimeMonths = churnRate > 0 ? 1 / churnRate : 100;
    const ltv = (arpu / 12) * avgLifetimeMonths;
    const ltvCacRatio = ltv / cac;
    const paybackMonths = cac / (arpu / 12);

    // Determine health
    let health = 'Poor';
    let healthColor = 'rgb(239, 68, 68)';
    if (ltvCacRatio >= 3) {
      health = 'Excellent';
      healthColor = 'rgb(34, 197, 94)';
    } else if (ltvCacRatio >= 2) {
      health = 'Good';
      healthColor = 'rgb(234, 179, 8)';
    } else if (ltvCacRatio >= 1) {
      health = 'Fair';
      healthColor = 'rgb(249, 115, 22)';
    }

    resultsDiv.innerHTML = `
      <div style="margin-top: 20px; padding: 20px; background: rgba(0,0,0,0.03); border-radius: 8px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <div>
            <div style="font-size: 0.875rem; color: rgba(0,0,0,0.6);">Customer Lifetime Value</div>
            <div style="font-size: 1.5rem; font-weight: bold;">$${ltv.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: rgba(0,0,0,0.6);">LTV:CAC Ratio</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${healthColor};">${ltvCacRatio.toFixed(2)}:1</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: rgba(0,0,0,0.6);">CAC Payback Period</div>
            <div style="font-size: 1.5rem; font-weight: bold;">${paybackMonths.toFixed(1)} months</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: rgba(0,0,0,0.6);">Unit Economics Health</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${healthColor};">${health}</div>
          </div>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 0.875rem; color: rgba(0,0,0,0.6);">
          <strong>Guidance:</strong>
          LTV:CAC of 3:1 or higher is excellent.
          Payback period under 12 months is ideal for bootstrapped businesses.
          Avg customer lifetime: ${avgLifetimeMonths.toFixed(1)} months
        </div>
      </div>
    `;
  }

  // Event listeners
  arpuInput.addEventListener('input', function(e) {
    document.getElementById('ueArpuValue').textContent = '$' + parseFloat(e.target.value).toLocaleString();
    calculate();
  });

  cacInput.addEventListener('input', function(e) {
    document.getElementById('ueCacValue').textContent = '$' + parseFloat(e.target.value).toLocaleString();
    calculate();
  });

  churnInput.addEventListener('input', function(e) {
    document.getElementById('ueChurnValue').textContent = e.target.value + '%';
    calculate();
  });

  // Initial calculation
  calculate();
}

// =============================================================================
// Graph 4: Coordination Overhead Visualization
// =============================================================================
function initCoordinationChart() {
  const ctx = document.getElementById('coordinationChart');
  if (!ctx) return;

  const teamSizes = Array.from({ length: 20 }, (_, i) => i + 1);

  // Calculate communication channels: n(n-1)/2
  const channels = teamSizes.map(n => n * (n - 1) / 2);

  // Calculate productive time (approximate based on coordination overhead)
  const productiveHours = teamSizes.map(n => {
    // Assume 40 hour week
    // Solo: 95% productive (38 hours)
    // Small team (2-4): 75% productive (30 hours)
    // Medium team (5-9): 45% productive (18 hours)
    // Large team (10+): 30% productive (12 hours)
    if (n === 1) return 38;
    if (n <= 4) return 30;
    if (n <= 9) return 18;
    return 12;
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: teamSizes,
      datasets: [
        {
          label: 'Communication Channels',
          data: channels,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          yAxisID: 'y',
          fill: true
        },
        {
          label: 'Productive Hours/Week per Person',
          data: productiveHours,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
          yAxisID: 'y1',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Coordination Overhead vs. Team Size',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              if (context.datasetIndex === 0) {
                const n = context.parsed.x;
                return `Formula: ${n}×(${n}-1)÷2`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Team Size (number of people)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Communication Channels'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Productive Hours/Week'
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    }
  });
}

// =============================================================================
// Initialize all charts when DOM is ready
// =============================================================================
function initAllCharts() {
  console.log('Initializing solopreneur charts...');

  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('✗ Chart.js is not loaded! Make sure the CDN script is included before this script.');
    return;
  }

  console.log('✓ Chart.js loaded successfully');

  try {
    initCostStructureChart();
    console.log('✓ Cost Structure Chart initialized');
  } catch (e) {
    console.error('✗ Error initializing Cost Structure Chart:', e);
  }

  try {
    initTimeToARRChart();
    console.log('✓ Time to ARR Chart initialized');
  } catch (e) {
    console.error('✗ Error initializing Time to ARR Chart:', e);
  }

  try {
    initUnitEconomicsCalc();
    console.log('✓ Unit Economics Calculator initialized');
  } catch (e) {
    console.error('✗ Error initializing Unit Economics Calculator:', e);
  }

  try {
    initCoordinationChart();
    console.log('✓ Coordination Chart initialized');
  } catch (e) {
    console.error('✗ Error initializing Coordination Chart:', e);
  }
}

// Wait for both DOM and Chart.js to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure Zola's markdown processing is complete
    setTimeout(initAllCharts, 100);
  });
} else {
  // DOMContentLoaded already fired
  setTimeout(initAllCharts, 100);
}
