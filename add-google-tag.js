const fs = require('fs');
const path = require('path');

// Google Tag to insert
const googleTag = `
  <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FHQ9GN5T61"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'G-FHQ9GN5T61');
    </script>
`;

// Function to add Google Tag before </head> if it doesn't already exist
const addGoogleTag = (filePath) => {
  // Read the HTML file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    // Check if the Google tag is already present
    if (data.includes(googleTag)) {
      console.log(`Google tag already exists in ${filePath}`);
      return; // Do not add the tag again
    }

    // Insert Google Tag before </head>
    const modifiedData = data.replace('</head>', `${googleTag}</head>`);

    // Write the modified data back to the file
    fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to file ${filePath}:`, err);
      } else {
        console.log(`Successfully updated ${filePath}`);
      }
    });
  });
};

// Directory containing HTML files (same directory as the script)
const directoryPath = '.'; // Use '.' for the current directory

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter out HTML files and process them
  files.filter(file => file.endsWith('.html')).forEach(file => {
    const filePath = path.join(directoryPath, file);
    addGoogleTag(filePath);
  });
});
