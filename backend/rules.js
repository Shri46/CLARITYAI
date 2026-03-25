const RULES = {
  "Food & Dining": ["swiggy", "zomato", "mcdonald", "domino", "starbucks", "kfc", "eats", "restaurant", "cafe"],
  "Transport": ["uber", "ola", "irctc", "rapido", "metro", "redbus", "flight", "railway"],
  "Shopping": ["amazon", "flipkart", "myntra", "ajio", "blinkit", "instamart", "zepto", "dmart", "reliance", "supermarket"],
  "Bills & Utilities": ["jio", "airtel", "vi", "bescom", "electricity", "water", "gas", "recharge", "broadband"],
  "Entertainment": ["netflix", "spotify", "prime", "hotstar", "youtube", "bookmyshow", "pvr", "cinema"],
  "Health": ["apollo", "practo", "pharmacy", "netmeds", "1mg", "hospital", "clinic", "medplus"],
  "Finance": ["emi", "sip", "zerodha", "groww", "upstox", "loan", "insurance", "lic", "mutual fund"],
  "Education": ["udemy", "coursera", "byjus", "upgrad", "school", "college", "fee", "tuition"],
  "Travel": ["makemytrip", "yatra", "agoda", "airbnb", "hotel", "indigo", "spicejet", "vistara", "cleartrip"],
  "Income": ["salary", "neft", "rtgs", "credited", "refund", "interest", "dividend"],
  "Transfer": ["upi", "paytm", "gpay", "phonepe", "transfer to", "cred"]
};

function categorizeWithRules(description) {
  const descLower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(RULES)) {
    for (const keyword of keywords) {
      if (descLower.includes(keyword)) {
        return {
          category,
          source: 'rules',
          confidence: 95
        };
      }
    }
  }
  return null;
}

module.exports = {
  RULES,
  categorizeWithRules
};
