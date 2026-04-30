import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import numpy as np

try:
    from xgboost import XGBClassifier
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False
    print("XGBoost not available. Will train Random Forest and Logistic Regression.")

def inject_synthetic_diseases(df):
    """
    Injects new diseases requested by user (Flu, Sinusitis, Anxiety, Depression, Viral Fever)
    that might be missing from the original dataset.
    """
    new_rows = []
    columns = df.columns
    
    # Define symptom profiles for new diseases
    profiles = {
        "Flu": ["high_fever", "chills", "muscle_pain", "headache", "fatigue", "cough"],
        "Sinusitis": ["headache", "congestion", "runny_nose", "loss_of_smell", "fatigue"],
        "Anxiety": ["anxiety", "restlessness", "sweating", "fast_heart_rate", "dizziness"],
        "Depression": ["depression", "fatigue", "lethargy", "loss_of_appetite", "mood_swings"],
        "Viral Fever": ["high_fever", "chills", "fatigue", "muscle_pain", "joint_pain"],
        "UTI": ["burning_micturition", "bladder_discomfort", "continuous_feel_of_urine", "mild_fever"]
    }
    
    for disease, symptoms in profiles.items():
        row_data = {col: 0 for col in columns}
        row_data['prognosis'] = disease
        for sym in symptoms:
            if sym in columns:
                row_data[sym] = 1
        new_rows.append(row_data)
        
    new_df = pd.DataFrame(new_rows)
    return pd.concat([df, new_df], ignore_index=True)

def augment_data(df, num_copies=10, noise_level=0.1):
    """
    Since Testing.csv is very small (42 rows), we augment it to make models more robust.
    We copy the data and flip a small percentage of 0s to 1s and 1s to 0s to simulate noise.
    """
    print(f"Original dataset shape: {df.shape}")
    augmented_dfs = [df]
    
    features = df.columns[:-1]
    
    for _ in range(num_copies):
        noise_df = df.copy()
        
        # Add some random noise
        for index, row in noise_df.iterrows():
            for feature in features:
                if np.random.rand() < noise_level:
                    noise_df.at[index, feature] = 1 - noise_df.at[index, feature]
        
        augmented_dfs.append(noise_df)
        
    final_df = pd.concat(augmented_dfs, ignore_index=True)
    print(f"Augmented dataset shape: {final_df.shape}")
    return final_df

def train_and_save_model():
    # 1. Load Data
    try:
        df = pd.read_csv("Testing.csv")
    except Exception as e:
        print(f"Error loading Testing.csv: {e}")
        return

    # 1.5 Inject extra diseases
    df = inject_synthetic_diseases(df)

    # 2. Augment Data (Optional, but helps with small datasets)
    df = augment_data(df, num_copies=30, noise_level=0.05)

    # 3. Prepare X and y
    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values

    # Encode labels for XGBoost if needed
    classes = np.unique(y)
    label_map = {label: idx for idx, label in enumerate(classes)}
    idx_to_label = {idx: label for label, idx in label_map.items()}
    y_encoded = np.array([label_map[label] for label in y])

    # 4. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=2000, random_state=42)
    }

    if XGB_AVAILABLE:
        models["XGBoost"] = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)

    best_model = None
    best_accuracy = 0
    best_name = ""

    print("\nTraining models...")
    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        acc = accuracy_score(y_test, predictions)
        print(f"{name} Accuracy: {acc * 100:.2f}%")
        
        if acc > best_accuracy:
            best_accuracy = acc
            best_model = model
            best_name = name

    print(f"\nBest Model: {best_name} with Accuracy: {best_accuracy * 100:.2f}%")

    # Save the model and label mapping together
    model_data = {
        "model": best_model,
        "label_map": idx_to_label, # To decode predictions
        "features": list(df.columns[:-1]) # Save feature order
    }
    
    joblib.dump(model_data, "disease_prediction_model.pkl")
    print("Saved best model to 'disease_prediction_model.pkl'")

if __name__ == "__main__":
    train_and_save_model()
