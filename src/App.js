import React, { useEffect, useState } from "react";

const decodeHtmlEntities = (str) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str.replace(/,/g, "&#44;");
  return txt.value;
  // Handle malformed HTML entities
  // Example: &#x27; &amp;#x27; -> &#39;
};

// Function to export data to CSV
const exportToCSV = (data) => {
  const csv = [
    "id, date, title",
    ...data.map((row) => {
      const id = row.id;
      const date = row.date;
      const title = `${row.title.rendered.replace(/,/g, "&#44;")}`;
      const content = JSON.stringify(row.content.rendered.replace(/,/g, "&#44;"));
      // `"${decodeHtmlEntities(row.content.rendered).replace(/,/g, "&#44;").replace(/"/g, "&quot;")}"` || "";
      return `${id}, ${date}, ${title}, ${content}`;
    }),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "articles_since_august_data.csv";
  a.click();
  URL.revokeObjectURL(url);
};

function App() {
  const [url, setUrl] = useState("");
  //const [message, setMessage] = useState("");
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const perPage = 100;
      let allPosts = [];
      let currentPage = 1;
      try {
        // while (currentPage < 5) {
        while (currentPage < 2) {
          const response = await fetch(
            `https://www.legalshield.com/wp-json/wp/v2/posts?orderby=date&order=desc&after=2024-08-01T01:00:00&page=${currentPage}&per_page=${perPage}`
          );
          const posts = await response.json();
          // get headers from response
          const headers = response.headers;
          console.log(posts);
          // Check if the total number of pages is available
          const totalPosts = parseInt(headers.get("x-wp-total"));
          // // If the current page is the last page, break the loop
          // if (50 < totalPosts) {
          //   break;
          // }
          // If the current page has no posts, break the loop (no more posts on this page)
          // Note: This may not be the case if the last page has less than the specified per_page
          // In that case, the loop will continue until it finds a page with posts
          // Example: If the last page has 5 posts, the loop will continue until it finds a page with 100 posts
          // In this case, the loop will break after finding the last page with 5 posts
          // To handle this case, you can add a condition to check if the last page has less than the specified per_page
          // Example
          if (posts.length === 0) {
            break; // No more posts, exit loop
          }
          allPosts = allPosts.concat(posts);
          currentPage++;
        }
        setData(allPosts);
        setCount(allPosts.length);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setData(data);
      setCount(data.length);
      //setMessage(`Data fetched successfully: ${JSON.stringify(data)}`);
      // setMessage(`Data fetched successfully: ${JSON.stringify(data2)}`);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      //setMessage(`Error fetching data: ${error.message}`);
    }
  };
  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">External Link:</label>
          <input
            type="url"
            id="url"
            className="form-control"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      {/* {message && <p>{message}</p>} */}
      <p>Total Posts: {count}</p>
      <button onClick={() => exportToCSV(data)} className="btn btn-secondary">
        Export to CSV
      </button>
      {data.map((item, key) => (
        <div key={key}>
          <h2>{decodeHtmlEntities(item.title.rendered)}</h2>
          <span>
            <div dangerouslySetInnerHTML={{ __html: item.content.rendered }} />
          </span>
        </div>
      ))}
    </div>
  );
}

export default App;
