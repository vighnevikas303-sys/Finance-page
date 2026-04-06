const AppState={
  role:"admin",
  filter:"all",
  search:"",
  sortBy:"date",
  sortDir:"desc",
  activePage:"overview",
  selectedPeriod:"1M",
};

const transactions = [
  { id: 1,  date: "2026-04-03", desc: "Salary deposit",        category: "Salary",        type: "income",  amount: 5200 },
  { id: 2,  date: "2026-04-02", desc: "Monthly rent",          category: "Rent",          type: "expense", amount: 2100 },
  { id: 3,  date: "2026-04-01", desc: "Grocery store",         category: "Food",          type: "expense", amount: 340  },
  { id: 4,  date: "2026-03-30", desc: "Index fund purchase",   category: "Investment",    type: "expense", amount: 500  },
  { id: 5,  date: "2026-03-29", desc: "Netflix + Spotify",     category: "Subscriptions", type: "expense", amount: 28   },
  { id: 6,  date: "2026-03-28", desc: "Electricity bill",      category: "Utilities",     type: "expense", amount: 95   },
  { id: 7,  date: "2026-03-27", desc: "Freelance payment",     category: "Freelance",     type: "income",  amount: 1800 },
  { id: 8,  date: "2026-03-26", desc: "Restaurant dinner",     category: "Food",          type: "expense", amount: 87   },
  { id: 9,  date: "2026-03-25", desc: "Water bill",            category: "Utilities",     type: "expense", amount: 42   },
  { id: 10, date: "2026-03-24", desc: "Online course",         category: "Education",     type: "expense", amount: 129  },
  { id: 11, date: "2026-03-23", desc: "Dividend income",       category: "Investment",    type: "income",  amount: 320  },
  { id: 12, date: "2026-03-22", desc: "Gas station",           category: "Transport",     type: "expense", amount: 65   },
  { id: 13, date: "2026-03-20", desc: "Medical checkup",       category: "Health",        type: "expense", amount: 150  },
  { id: 14, date: "2026-03-18", desc: "Coffee shop",           category: "Food",          type: "expense", amount: 34   },
  { id: 15, date: "2026-03-15", desc: "Internet bill",         category: "Utilities",     type: "expense", amount: 60   },
  { id: 16, date: "2026-03-12", desc: "Side project income",   category: "Freelance",     type: "income",  amount: 600  },
  { id: 17, date: "2026-03-10", desc: "Gym membership",        category: "Health",        type: "expense", amount: 45   },
  { id: 18, date: "2026-03-08", desc: "Amazon shopping",       category: "Shopping",      type: "expense", amount: 178  },
  { id: 19, date: "2026-03-05", desc: "Uber rides",            category: "Transport",     type: "expense", amount: 38   },
  { id: 20, date: "2026-03-01", desc: "Bonus payment",         category: "Salary",        type: "income",  amount: 480  },
];


const historicalMonths = [
  { key: "2025-11", month: "Nov", income: 6800, expenses: 4400 },
  { key: "2025-12", month: "Dec", income: 7400, expenses: 5100 },
  { key: "2026-01", month: "Jan", income: 6100, expenses: 5400 },
  { key: "2026-02", month: "Feb", income: 8000, expenses: 4600 },
];

const categoryColors = {
  Salary:        { bg: "#E9F5E9", text: "#2E7D32", dot: "#4CAF50" },
  Rent:          { bg: "#FBE9E7", text: "#BF360C", dot: "#FF5722" },
  Food:          { bg: "#FFF8E1", text: "#F57F17", dot: "#FFC107" },
  Investment:    { bg: "#E3F2FD", text: "#0D47A1", dot: "#2196F3" },
  Subscriptions: { bg: "#EDE7F6", text: "#4527A0", dot: "#7C4DFF" },
  Utilities:     { bg: "#E0F7FA", text: "#006064", dot: "#00BCD4" },
  Freelance:     { bg: "#F3E5F5", text: "#6A1B9A", dot: "#9C27B0" },
  Education:     { bg: "#E8F5E9", text: "#1B5E20", dot: "#66BB6A" },
  Transport:     { bg: "#ECEFF1", text: "#37474F", dot: "#78909C" },
  Health:        { bg: "#FCE4EC", text: "#880E4F", dot: "#E91E63" },
  Shopping:      { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
};


