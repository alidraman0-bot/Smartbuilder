const url = "https://gdpaugdddompzigbptho.supabase.co/rest/v1/";
const key = "sb_publishable_Q-tWqMpLOtzx0c1VkYsueA_j4RJMunN";

console.log(`Testing fetch to ${url}...`);

fetch(url, {
    headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
    }
})
    .then(res => {
        console.log(`Status: ${res.status} ${res.statusText}`);
        return res.text();
    })
    .then(text => {
        console.log(`Response length: ${text.length}`);
        console.log(`Response preview: ${text.substring(0, 100)}`);
    })
    .catch(err => {
        console.error("Fetch failed:", err);
    });
