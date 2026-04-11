import os, glob, sys
sys.stdout.reconfigure(encoding='utf-8')

files = sorted(glob.glob('*.csv'))
print(f"Total CSV files: {len(files)}")
print("-"*40)
for f in files:
    size = os.path.getsize(f)
    print(f"  {f}  ->  {size//1024} KB ({size:,} bytes)")

print()
print("Previewing main data sheet (dataset.csv):")
import pandas as pd
try:
    df = pd.read_csv('dataset.csv')
    print(f"  Rows: {len(df)}, Columns: {len(df.columns)}")
    print(f"  Columns: {list(df.columns)}")
    print(df.head(3).to_string())
except Exception as e:
    print(f"  Error: {e}")
