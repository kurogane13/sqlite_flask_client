from flask import Flask, request, jsonify, g, abort, render_template
import sqlite3
import os

app = Flask(__name__)

# Create the saved paths file if it doesn't exist
os.system('touch saved_db_paths.txt')

def get_db(db_path):
    """Get a database connection."""
    db = sqlite3.connect(db_path)
    return db

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/validate_path', methods=['POST'])
def validate_path():
    data = request.get_json()
    db_path = data.get('db_path')

    # Check if the provided path is valid and exists as a file
    if db_path and os.path.isfile(db_path):
        return jsonify(valid=True)  # Return valid response
    else:
        return jsonify(valid=False), 400  # Return invalid response

@app.route('/save_db_path', methods=['POST'])
def save_db_path():
    data = request.get_json()
    db_path = data.get('db_path')

    # Validate if the provided path exists and is a file
    if db_path and os.path.isfile(db_path):
        try:
            # Flag to check if the path is already saved
            path_already_saved = False  

            # Check if the file 'saved_db_paths.txt' exists
            if os.path.exists('saved_db_paths.txt'):
                with open('saved_db_paths.txt', 'r') as file:
                    # Read each line and compare it with the provided db_path
                    for line in file:
                        saved_path = line.strip()  # Remove any leading/trailing spaces or newlines
                        if saved_path == db_path:
                            path_already_saved = True
                            break  # Exit the loop if the path is found

            # If the path is not saved, append it to the file
            if not path_already_saved:
                with open('saved_db_paths.txt', 'a') as file:
                    file.write(db_path + '\n')  # Append the new path
                return jsonify(message="Database path saved: " + db_path), 200
            else:
                # If the path is already saved, return a message without modifying the file
                return jsonify(message="Path already exists!"), 400

        except Exception as e:
            return jsonify({"error": str(e)}), 500  # Handle any file errors
    else:
        # Return error if the provided path does not exist or is not a valid file
        return jsonify({"error": "Invalid path or file does not exist."}), 400

@app.route('/saved_db_paths', methods=['GET'])
def saved_db_paths():
    try:
        # Construct the path to the saved_db_paths.txt file
        db_file_path = os.path.join(os.getcwd(), 'saved_db_paths.txt')
        print(f"Looking for saved paths in: {db_file_path}")  # Debug: print the path to console
        
        # Check if the file exists
        if os.path.exists(db_file_path):
            with open(db_file_path, 'r') as file:
                # Read non-empty lines
                paths = [line.strip() for line in file.readlines() if line.strip()]
            print(f"Saved paths found: {paths}")  # Debug: print paths found
        else:
            print("File not found.")  # Debug: notify if file does not exist
            return jsonify([])  # Return an empty list if the file does not exist

        return jsonify(paths)  # Return the list of paths as JSON
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debug: print error message
        return jsonify({"error": str(e)}), 500  # Return error if file read fails
        
        
@app.route('/saved_queries', methods=['GET'])
def saved_queries():
    try:
        # Construct the path to the saved_queries.txt file
        db_file_path = os.path.join(os.getcwd(), 'saved_queries.txt')
        print(f"Looking for saved queries in: {db_file_path}")  # Debug: print the path to console
        
        # Check if the file exists
        if os.path.exists(db_file_path):
            with open(db_file_path, 'r') as file:
                # Read non-empty lines
                queries = [line.strip() for line in file.readlines() if line.strip()]
            print(f"Saved queries found: {queries}")  # Debug: print queries found
        else:
            print("Queries file not found.")  # Debug: notify if file does not exist
            return jsonify([])  # Return an empty list if the file does not exist

        return jsonify(queries)  # Return the list of queries as JSON
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debug: print error message
        return jsonify({"error": str(e)}), 500  # Return error if file read fails


# Route to list tables from any provided database path
@app.route('/list_tables', methods=['POST'])
def list_tables():
    data = request.get_json()
    db_path = data.get('db_path')

    if not db_path or not os.path.exists(db_path):
        return {"error": "Database file path is inexistent or invalid. Provide a valid filepath to a .db sqlite file."}, 400

    try:
        conn = get_db(db_path)
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        return jsonify(tables), 200
    except Exception as e:
        return {"error": str(e)}, 500

# Route to list tables from a saved database path
@app.route('/list_tables_saved', methods=['POST'])
def list_tables_saved():
    data = request.get_json()
    db_path = data.get('db_path')

    # Check if the saved path exists in the file
    try:
        with open('saved_db_paths.txt', 'r') as file:
            saved_paths = [line.strip() for line in file.readlines()]
        
        if db_path not in saved_paths:
            return {"error": "Database path not found in saved paths."}, 400

        # List tables from the saved path
        conn = get_db(db_path)
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        return jsonify(tables), 200
    except Exception as e:
        return {"error": str(e)}, 500

# Route to run query on a specific database path
@app.route('/run_query', methods=['POST'])
def run_query():
    data = request.get_json()
    db_path = data.get('db_path')
    query = data.get('query')
    db_file_path = os.path.join(os.getcwd(), 'saved_queries.txt')

    if not db_path or not os.path.exists(db_path):
        return {"error": "Database path is invalid."}, 400

    try:
        # Execute the query on the provided db_path
        conn = get_db(db_path)
        cursor = conn.execute(query)
        results = cursor.fetchall()
        conn.close()

        query_already_saved = False  # Flag to track if the query is already saved

        # Check if 'saved_queries.txt' exists
        if os.path.exists(db_file_path):
            # Open the file and read it line by line
            with open(db_file_path, 'r') as file:
                for line in file:
                    saved_query = line.strip()  # Remove any leading/trailing spaces or newlines
                    if saved_query == query.strip():  # Compare the queries
                        query_already_saved = True
                        break  # Exit the loop if the query is found

        query_saved = False  # Flag to track if the query was saved

        # If the query was not already saved, append it to the file
        if not query_already_saved:
            with open(db_file_path, 'a') as file:
                file.write(query + '\n')  # Append the new query to the file
            query_saved = True  # Mark the query as saved

        return jsonify({"results": results, "query_saved": query_saved}), 200

    except Exception as e:
        return {"error": str(e)}, 500

        
@app.route('/run_query_saved', methods=['POST'])
def run_query_saved():
    data = request.get_json()
    db_path = data.get('db_path')  # Now expects db_path from the client
    query = data.get('query')

    # Check if db_path is provided
    if not db_path:
        return {"error": "No database path provided."}, 400

    # Check if the query is provided
    if not query:
        return {"error": "No query provided."}, 400

    try:
        # Execute the query on the provided db_path
        conn = get_db(db_path)
        cursor = conn.execute(query)
        results = cursor.fetchall()
        conn.close()
        return jsonify(results), 200
    except Exception as e:
        return {"error": str(e)}, 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
