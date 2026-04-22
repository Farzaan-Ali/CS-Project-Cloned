import datetime

#This file is to provide the links to the API's that are going to be used.

#this class exists for testing purposes as we don't have db access
class MockSDKProvider:
    """
    Code should be changed ONLY in these functions if this class is reused
    """
    def get_internal_tools(self):
        # MOCK DATA
        return [
            {
                "id": 1, 
                "name": "Project W.A.F.F.L.E. stuff", 
                "status": "active", 
                "last_updated": datetime.datetime.now(),
                "metadata": {"version": "1.0.0", "db_status": "pending_access"}
            },
            {
                "id": 2, 
                "name": "RCC Security Spine Gateway", 
                "status": "online", 
                "last_updated": datetime.datetime.now(),
                "metadata": {"tier": "internal", "auth_level": "admin"}
            }
        ]
    
class MockAuthProvider:
    def verify_credentials(self, email, password):
        # MOCK LOGIC to check fake database
        if email == "admin@rcc.com" and password == "waffle2026":
            return {
                "success": True,
                "token": "mock-jwt-token-rcc-spine-8832",
                "user_metadata": {
                    "role": "SuperAdmin",
                    "department": "Security"
                }
            }
        
        # If it fails
        return {"success": False, "error": "Invalid email or password."}
    
class ConnectionLabelManager:
    """
    This class resolves string labels into actual ODBC connection details.
    Later, this will read from the WAFFLE Admin Panel database.
    """
    def get_connection_string(self, label):
        # MOCK LOGIC: Simulate looking up the label in the Admin Panel
        registry = {
            "waffle_local_dev": "Driver={ODBC Driver 18 for SQL Server};Server=localhost;...",
            "waffle_cloud_prod": "Driver={ODBC Driver 18 for SQL Server};Server=cloud.rcc.com;..."
        }
        if label not in registry:
            raise ValueError(f"Unknown connection label: {label}")
        return registry[label]


class SQLServerAuthProvider:
    """
    Provider uses the label to connect to the specific SQL Server 
    and validates against the [dbo].[tblUser] table
    """
    def __init__(self, connection_label="waffle_local_dev"):
        self.label_manager = ConnectionLabelManager()
        #resolve the label into a physical connection string
        self.connection_string = self.label_manager.get_connection_string(connection_label)

    def verify_credentials(self, user_login, password):
        #TODO: replace this Mock with actual pyodbc(module to access ODBC(microsoft) databases) connection using self.connection_string
        #cursor = connection.cursor()
        #cursor.execute("SELECT DisplayName, Role, Portal, IsActive FROM tblUser WHERE UserLogin=?", user_login)
        
        #MOCK LOGIC: Matching the tblUser schema 
        if user_login == "admin" and password == "waffle2026":
            return {
                "success": True,
                "token": "jwt-token-rcc-spine-8832", #generate jwt token later
                "user_data": {
                    "DisplayName": "System Administrator",
                    "Role": "admin",
                    "Portal": "waffle",
                    "IsActive": True
                }
            }
        
        return {"success": False, "error": "Invalid UserLogin or Password."}