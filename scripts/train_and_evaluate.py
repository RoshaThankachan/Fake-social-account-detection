import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    auc
)

# Set style for professional, publication-quality figures
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300

def main():
    print("=" * 60)
    print("Fake Social Media Account Detection - ML Pipeline")
    print("=" * 60)
    
    # 1. Load Dataset
    data_path = 'fake_social_media_global_2.0_with_missing.xlsx'
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset {data_path} not found!")
    
    print(f"Loading dataset from: {data_path}")
    df = pd.read_excel(data_path)
    print(f"Dataset shape: {df.shape}")
    
    # 2. Define Features
    features = [
        "has_profile_pic",
        "bio_length",
        "username_randomness",
        "followers",
        "following",
        "follower_following_ratio",
        "account_age_days",
        "posts",
        "posts_per_day",
        "caption_similarity_score",
        "content_similarity_score",
        "follow_unfollow_rate",
        "spam_comments_rate",
        "generic_comment_rate",
        "suspicious_links_in_bio",
        "verified",
        "username_length",
        "digits_count",
        "digit_ratio",
        "special_char_count",
        "repeat_char_count"
    ]
    
    # 3. Missing Value Imputation
    X_raw = df[features].copy()
    medians = X_raw.median().to_dict()
    X = X_raw.fillna(medians)
    y = df["is_fake"]
    
    print("Target distribution:")
    print(y.value_counts())
    
    # Generate Target Distribution Plot
    plt.figure(figsize=(7, 5))
    target_counts = y.value_counts()
    colors = ['#10b981', '#ef4444']
    bars = plt.bar(['Genuine (0)', 'Fake (1)'], target_counts.values, color=colors, width=0.55, edgecolor='#1e293b', linewidth=1.5)
    plt.title('Target Variable Distribution (is_fake)', fontsize=14, fontweight='bold', pad=15)
    plt.ylabel('Number of Accounts', fontsize=12)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    for bar in bars:
        h = bar.get_height()
        pct = (h / len(y)) * 100
        plt.text(bar.get_x() + bar.get_width() / 2, h + 25, f"{h:,} ({pct:.1f}%)", ha='center', va='bottom', fontsize=11, fontweight='bold')
    plt.ylim(0, max(target_counts.values) * 1.15)
    plt.tight_layout()
    plt.savefig('assets/images/target_distribution.png')
    plt.close()
    print("Saved target_distribution.png")

    # Generate Missing Values Plot
    missing_counts = X_raw.isnull().sum()
    missing_non_zero = missing_counts[missing_counts > 0].sort_values(ascending=True)
    if len(missing_non_zero) > 0:
        plt.figure(figsize=(9, 6))
        bars = plt.barh(missing_non_zero.index, missing_non_zero.values, color='#6366f1', edgecolor='#312e81', height=0.6)
        plt.title('Missing Value Count per Feature (Handled via Median Imputation)', fontsize=13, fontweight='bold', pad=12)
        plt.xlabel('Missing Count (Total: 3,000)', fontsize=11)
        plt.grid(axis='x', linestyle='--', alpha=0.5)
        for bar in bars:
            w = bar.get_width()
            plt.text(w + 5, bar.get_y() + bar.get_height()/2, f"{int(w)} ({w/3000*100:.1f}%)", va='center', fontsize=9)
        plt.xlim(0, max(missing_non_zero.values) + 50)
        plt.tight_layout()
        plt.savefig('assets/images/missing_values.png')
        plt.close()
        print("Saved missing_values.png")

    # 4. Train-Test Split (80:20, stratify=y, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train set: {X_train.shape}, Test set: {X_test.shape}")

    # 5. Model Training
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    print("Random Forest model trained successfully!")

    # 6. Predictions & Evaluation
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "=" * 40)
    print("EVALUATION RESULTS")
    print("=" * 40)
    print(f"Accuracy : {acc:.6f} ({acc*100:.2f}%)")
    print(f"Precision: {prec:.6f} ({prec*100:.2f}%)")
    print(f"Recall   : {rec:.6f} ({rec*100:.2f}%)")
    print(f"F1-Score : {f1:.6f} ({f1*100:.2f}%)")
    print("Confusion Matrix:\n", cm)

    # 7. Generate Confusion Matrix Plot
    plt.figure(figsize=(6.5, 5.5))
    cm_labels = [f"TN\n{cm[0,0]}", f"FP\n{cm[0,1]}", f"FN\n{cm[1,0]}", f"TP\n{cm[1,1]}"]
    cm_labels = np.asarray(cm_labels).reshape(2, 2)
    sns.heatmap(
        cm,
        annot=cm_labels,
        fmt="",
        cmap='Blues',
        cbar=True,
        xticklabels=['Predicted Genuine', 'Predicted Fake'],
        yticklabels=['Actual Genuine', 'Actual Fake'],
        annot_kws={'size': 14, 'weight': 'bold'},
        linewidths=1.5,
        linecolor='#cbd5e1'
    )
    plt.title('Confusion Matrix - Random Forest (Test Set N=600)', fontsize=13, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig('assets/images/confusion_matrix.png')
    plt.close()
    print("Saved confusion_matrix.png")

    # 8. Generate Model Performance Bar Chart
    plt.figure(figsize=(7.5, 5))
    metrics_names = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
    metric_values = [acc, prec, rec, f1]
    palette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    bars = plt.bar(metrics_names, metric_values, color=palette, width=0.5, edgecolor='#1e293b', linewidth=1.5)
    plt.title('Random Forest Evaluation Metrics', fontsize=14, fontweight='bold', pad=15)
    plt.ylabel('Score (0.0 to 1.0)', fontsize=12)
    plt.ylim(0, 1.1)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    for bar, val in zip(bars, metric_values):
        plt.text(bar.get_x() + bar.get_width()/2, val + 0.02, f"{val*100:.2f}%", ha='center', va='bottom', fontsize=11, fontweight='bold')
    plt.tight_layout()
    plt.savefig('assets/images/model_performance.png')
    plt.close()
    print("Saved model_performance.png")

    # 9. Feature Importance Analysis & Plot
    fi_df = pd.DataFrame({
        "Feature": features,
        "Importance": model.feature_importances_
    }).sort_values(by="Importance", ascending=True)

    plt.figure(figsize=(10, 8))
    bars = plt.barh(fi_df['Feature'], fi_df['Importance'], color='#3b82f6', edgecolor='#1d4ed8', height=0.65)
    plt.title('Feature Importance (Random Forest Gini Impurity)', fontsize=14, fontweight='bold', pad=15)
    plt.xlabel('Importance Score', fontsize=12)
    plt.grid(axis='x', linestyle='--', alpha=0.5)
    for bar in bars:
        w = bar.get_width()
        plt.text(w + 0.003, bar.get_y() + bar.get_height()/2, f"{w*100:.2f}%", va='center', fontsize=9, fontweight='semibold')
    plt.xlim(0, max(fi_df['Importance']) * 1.15)
    plt.tight_layout()
    plt.savefig('assets/images/feature_importance.png')
    plt.close()
    print("Saved feature_importance.png")

    # 10. ROC Curve Plot
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)
    plt.figure(figsize=(7, 6))
    plt.plot(fpr, tpr, color='#2563eb', lw=2.5, label=f'Random Forest (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='#94a3b8', lw=1.5, linestyle='--', label='Random Guessing (AUC = 0.5000)')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=12)
    plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=12)
    plt.title('Receiver Operating Characteristic (ROC) Curve', fontsize=13, fontweight='bold', pad=12)
    plt.legend(loc="lower right", fontsize=11, frameon=True)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('assets/images/roc_curve.png')
    plt.close()
    print("Saved roc_curve.png")

    # 11. Save trained model
    joblib.dump(model, 'models/random_forest_model.pkl')
    print("Saved model to models/random_forest_model.pkl")

    # 12. Save Model Metadata & Sample Dataset Records for interactive website
    # Sample records with predictions for demo table
    test_sample_indices = X_test.head(40).index
    samples = []
    for idx in test_sample_indices:
        row = df.loc[idx]
        features_dict = {f: float(X.loc[idx, f]) for f in features}
        pred_label = int(model.predict([list(features_dict.values())])[0])
        pred_prob = float(model.predict_proba([list(features_dict.values())])[0][1])
        samples.append({
            "id": int(idx),
            "username": str(row.get('username', f"user_{idx}")),
            "platform": str(row.get('platform', 'Twitter')),
            "is_fake_actual": int(row['is_fake']),
            "is_fake_pred": pred_label,
            "confidence": round(pred_prob if pred_label == 1 else (1 - pred_prob), 4),
            "features": features_dict
        })

    # Export metadata
    sorted_fi = fi_df.sort_values(by="Importance", ascending=False)
    metadata = {
        "project_name": "Detection of Fake Social Media Accounts Using Behavioral Features",
        "author": "Rosha Thankachan",
        "author_id": "MCA2549",
        "github": "RoshaThankachan",
        "dataset_size": len(df),
        "features": features,
        "feature_medians": medians,
        "metrics": {
            "accuracy": acc,
            "accuracy_pct": round(acc * 100, 2),
            "precision": prec,
            "precision_pct": round(prec * 100, 2),
            "recall": rec,
            "recall_pct": round(rec * 100, 2),
            "f1_score": f1,
            "f1_score_pct": round(f1 * 100, 2),
            "roc_auc": round(float(roc_auc), 4),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "genuine_count": int((y == 0).sum()),
            "fake_count": int((y == 1).sum()),
            "confusion_matrix": {
                "tn": int(cm[0, 0]),
                "fp": int(cm[0, 1]),
                "fn": int(cm[1, 0]),
                "tp": int(cm[1, 1])
            }
        },
        "feature_importance": [
            {"feature": row['Feature'], "importance": round(float(row['Importance']), 6)}
            for _, row in sorted_fi.iterrows()
        ],
        "sample_records": samples
    }

    with open('models/model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    print("Saved metadata to models/model_metadata.json")
    print("=" * 60)
    print("Execution completed successfully!")
    print("=" * 60)

if __name__ == '__main__':
    main()
