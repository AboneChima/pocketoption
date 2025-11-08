# Quick Git Commands

## First Time Setup

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - Trading platform"

# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/pocketoption-clone.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Daily Updates

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub
git push
```

## Common Messages

```bash
git commit -m "Add trading features"
git commit -m "Fix bugs in dashboard"
git commit -m "Update Firebase integration"
git commit -m "Improve UI/UX"
git commit -m "Add admin panel features"
```

## Undo Changes (if needed)

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```
