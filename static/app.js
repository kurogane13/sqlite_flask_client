$(document).ready(function () {
    // Function to fetch files from the server and populate dropdown
    async function fetchFiles() {
        try {
            const response = await fetch('/files');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const files = await response.json();
            console.log("Files fetched:", files);  // Log files for debugging

            const dropdown = $('.saved-paths-dropdown');
            dropdown.empty();  // Clear previous options

            if (files.length > 0) {
                files.forEach(file => {
                    const option = $('<option>').val(file).text(file);
                    dropdown.append(option);
                });
            } else {
                dropdown.append('<option value="" disabled>No files found</option>');
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    }

    // Call the function to fetch files when the page loads
    window.onload = fetchFiles;

	// Function to fetch and display saved database paths in the dropdown
	function fetchSavedDatabasePaths() {
		$.ajax({
			url: '/saved_db_paths',  // Endpoint to retrieve saved paths
			type: 'GET',
			success: function (response) {
				// Clear the current dropdown options
				$('#saved-paths-dropdown').empty();
				$('#saved-paths-dropdown').append('<option value="" disabled selected>Select a saved database path</option>');  // Add placeholder

				// Check if paths are returned and populate the dropdown
				if (response.length > 0) {
					response.forEach(function (path) {
						$('#saved-paths-dropdown').append(`<option value="${path}">${path}</option>`);
					});
				} else {
					$('#saved-paths-dropdown').append('<option value="" disabled>No saved paths available</option>');
					console.log("No saved paths available.");  // Debug: log this message
				}
			},
			error: function (xhr) {
				$('#saved-paths-dropdown').empty();
				$('#saved-paths-dropdown').append('<option value="" disabled class="text-danger">Error fetching saved paths</option>');
				console.error("Error fetching saved paths:", xhr.responseJSON.error); // Log error for debugging
			}
		});
	}

	// Call the function to fetch saved database paths when the page loads
	$(document).ready(function () {
		fetchSavedDatabasePaths();
	});

	// Event handler for using a new database path
	$('.use-db-file-btn').on('click', function () {
		let dbPath = $('#db-path').val().trim();

		if (!dbPath) {
			alert("The database path field is empty.");
			return;
		}

		// Step 1: Validate the file path
		$.ajax({
			url: '/validate_path',  // Assuming you have a route to validate the path
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ db_path: dbPath }),
			success: function (response) {
				// Check if the validation is successful
				if (response.valid) {
					// Show an alert with the database file message and path
					alert("Using database file: " + dbPath);  // Alert with the user-provided path
					
					// Step 2: Call the save_db_path route to check if the path is saved or not
					$.ajax({
						url: '/save_db_path',  // Route to check and save the path
						type: 'POST',
						contentType: 'application/json',
						data: JSON.stringify({ db_path: dbPath }),
						success: function (response) {
							alert(response.message);  // Show confirmation
							console.log(response.message);  // Log confirmation message
							
							// Refresh the dropdown to include the new saved path
							fetchSavedDatabasePaths();
						},
						error: function (xhr) {
							alert("This database file is already saved in the database file.");  // Show error
						}
					});
				} else {
					alert("Invalid database path. Please select a valid file.");
				}
			},
			error: function (xhr) {
				alert("Error validating database path: " + xhr.responseJSON.error);  // Show error
			}
		});
	});


    // Event handler for selecting a saved database path
    $('.select-saved-db-btn').on('click', function () {
        let selectedPath = $('.saved-paths-dropdown').val();  // Get the selected path

        if (selectedPath) {
            $.ajax({
                url: '/validate_path',  // Endpoint to validate the selected path
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ db_path: selectedPath }),
                success: function (response) {
					alert("Using saved database file: " + selectedPath)
                    console.log(response.message);  // Log confirmation message
                },
                error: function (xhr) {
                    alert("Error: " + xhr.responseJSON.error);  // Show error
                }
            });
        } else {
            alert("Please select a valid database path.");
        }
    });

    // Function to list tables for the pasted database path
    $('#list-tables-dbpath-btn').on('click', function () {
        let dbPath = $('#db-path').val().trim();

        if (!dbPath) {
            alert("Please enter a database path first.");
            return;
        }

        $.ajax({
            url: '/list_tables',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ db_path: dbPath }),
            success: function (response) {
                $('#table-list').empty();  // Clear the previous list
                $('#table-list-saved-path').empty();  // Clear the previous list
                response.forEach(function (table) {
                    $('#table-list').append(`<li class="list-group-item">${table}</li>`);
                });
            },
            error: function (xhr) {
                $('#table-list').empty();
                $('#table-list').append(`<li class="list-group-item text-danger">${xhr.responseJSON.error}</li>`);
            }
        });
    });

    // Function to list tables for the selected saved database path
    $('#list-tables-savedpath-btn').on('click', function () {
        let selectedPath = $('.saved-paths-dropdown').val();

        if (!selectedPath) {
            alert("Please select a saved database path.");
            return;
        }

        $.ajax({
            url: '/list_tables',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ db_path: selectedPath }),
            success: function (response) {
                $('#table-list').empty();  // Clear the previous list
                $('#table-list-saved-path').empty();  // Clear the previous list
                response.forEach(function (table) {
					
                    $('#table-list').append(`<li class="list-group-item">${table}</li>`);
                });
            },
            error: function (xhr) {
                $('#table-list').empty();
                $('#table-list').append(`<li class="list-group-item text-danger">${xhr.responseJSON.error}</li>`);
            }
        });
    });
    
	// Function to fetch saved queries from saved_queries.txt
	function fetchSavedQueries() {
		$.ajax({
			url: '/saved_queries',  // Endpoint to retrieve saved queries
			type: 'GET',
			success: function (queries) {
				// Clear the current dropdown options
				$('#saved-queries-dropdown').empty();
				$('#saved-queries-dropdown').append('<option value="" disabled selected>Select a saved query</option>');  // Add placeholder

				// Populate the dropdown with saved queries
				if (queries && queries.length > 0) {
					queries.forEach(function (query) {
						$('#saved-queries-dropdown').append(`<option value="${query}">${query}</option>`);
					});
				} else {
					$('#saved-queries-dropdown').append('<option value="" disabled>No saved queries available</option>');
				}
			},
			error: function (xhr) {
				$('#saved-queries-dropdown').empty();
				$('#saved-queries-dropdown').append('<option value="" disabled class="text-danger">Error fetching saved queries</option>');
				console.error('Error fetching saved queries:', xhr.responseJSON ? xhr.responseJSON.error : xhr.statusText);  // Log error for debugging
			}
		});
	}

	// Call fetchSavedQueries when the page loads
	$(document).ready(function () {
		fetchSavedQueries();
	});


	// Event handler for running a saved query
	$('#run-saved-query-btn').on('click', function () {
		// Get the value from the manually entered db_path
		let manualDbPath = $('#db-path').val();
		
		// Get the selected saved db_path (if any) from the dropdown
		let selectedDbPath = $('.saved-paths-dropdown').val();  // Reference to the dropdown
		
		// Determine which db_path to use: prioritizing the saved path if selected
		let db_path = selectedDbPath ? selectedDbPath : manualDbPath;

		// Get the selected saved query from the dropdown
		let selectedQuery = $('#saved-queries-dropdown').val();

		// Ensure both db_path and selectedQuery are present before making the request
		if (!db_path || !selectedQuery) {
			alert("Database file is not set!")
			$('#terminal').text('Database path or saved query is missing.');
			return;
		}

		// Send the AJAX request to run the saved query
		$.ajax({
			url: '/run_query_saved',  // Ensure this endpoint works for saved queries
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ db_path: db_path, query: selectedQuery }),  // Sending the db_path and selected query
			success: function (response) {
				// Clear the terminal before showing new output
				$('#terminal').empty();

				// Check if the response contains data
				if (Array.isArray(response) && response.length > 0) {
					response.forEach(function (item) {
						// Iterate over each field in the item (key-value pair)
						for (const [key, value] of Object.entries(item)) {
							// Append each field on a new line as "key: value"
							$('#terminal').append(`<div>Line ${key}: ${value}</div>`);
						}
						// Add a line break after each item for better readability
						$('#terminal').append('<br/>');
						
					});
				} else {
					$('#terminal').text('No results found.');
				}
			},
			error: function (xhr) {
				// Display error message in the terminal
				$('#terminal').text(xhr.responseJSON.error);
			}
		});
	});

	// Run custom query
	$('#run-query-btn').on('click', function () {
		// Get the value from the manually entered db_path
		let manualDbPath = $('#db-path').val();
		
		// Get the selected saved db_path (if any) from the dropdown or list
		let selectedDbPath = $('.saved-paths-dropdown').val();
		
		// Determine which db_path to use: prioritizing the saved path if selected
		let db_path = selectedDbPath ? selectedDbPath : manualDbPath;

		// Get the custom query
		let query = $('#custom-query').val();

		// Ensure both the db_path and query are present before making the request
		if (!db_path || !query) {
			alert("Database file is not set!");
			$('#terminal').text('Database filepath is missing.');
			return;
		}
		
		// Send the AJAX request
		$.ajax({
			url: '/run_query',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ db_path: db_path, query: query }),
			success: function (response) {
				// Clear the terminal before showing new output
				$('#terminal').empty();

				// Check if the response contains data
				if (Array.isArray(response.results) && response.results.length > 0) {
					response.results.forEach(function (item) {
						// Iterate over each field in the item (key-value pair)
						for (const [key, value] of Object.entries(item)) {
							// Append each field on a new line as "key: value"
							$('#terminal').append(`<div>Line ${key}: ${value}</div>`);
						}
						// Add a line break after each item for better readability
						$('#terminal').append('<br/>');
					});

					// Fetch and update saved queries list after successful query execution
					fetchSavedQueries();

					// Show success alert only if the query has been saved
					if (response.query_saved) {
						alert('New query has been successfully saved!');
					}
				} else {
					alert("No results found.");  // Show error
					$('#terminal').text('No results found.');
				}
			},
			error: function (xhr) {
				// Display error message in the terminal
				$('#terminal').text(xhr.responseJSON.error);
			}
		});
	});


});
