from database import engine, Base

# Standalone script to initialize the database
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully.")
