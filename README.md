# SQLite Database Manager

## AUTHOR: GUSTAVO WYDLER AZUAGA
## VERSION: 1
## RELEASE DATE: 09-27-2024

Simple SQLite Database Manager for Linux built with Flask. 

- It allows users to interact with SQLite databases
- List tables
- Running custom SQL queries
- Saving database paths and queries for future use.

## Features

- Provide a valid SQLite database file.
- List saved SQLite database paths.
- List tables in a selected database.
- Run custom SQL queries.
- Save frequently used SQL queries for quick access.

## Technologies Used

- Flask: A micro web framework for Python.
- SQLite: A lightweight, serverless SQL database engine.
- Bootstrap: A front-end framework for building responsive websites.
- jQuery: A fast, small, and feature-rich JavaScript library.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kurogane13/sqlite_flask_client.git
   cd sqlite_flask_client

2. **Create and activate a python venv:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate

3. **Install the requirements**
   
   ```bash
    pip install -r requirements.txt

5. **Depending on your system, you need to allow port 5000 through the firewall:**

   ```bash
   # For RHEL based systems:

   sudo firewall-cmd --permanent --add-port=5000/tcp
   sudo firewall-cmd --reload
   
   #For DEBIAN based systems (like Ubuntu):

   sudo ufw allow 5000/tcp
   sudo ufw reload

6. **Run the Application**

   Start the Flask development server:
   ```bash
    python3.8 db_sqlite.py
 

