# Naming the branch

```
<initials>/<type>/<branch-desc>
```

- **initials**: Initials of who created the branch
- **type**: Type of the branch, `feat`, `bug`, `issue` and `refactor`
- **branch-desc**: A meaningfull name/description of the branch

# Branching

- **main** branch will be stable at any given time of the project and will have the source code for latest released of the application
- **dev** branch will be the containing upcoming releases, it will have CI/CD pipeline integreated.
- **feat** branch will contain the code realted to specific feature that will be merged with **dev** branch when it fully implemented
- **issue** branch will contain features specific issues that will evntually merge in to it's respective **feat** branch
- **bug** branch is a type of **issue** branch, however it will keep track of bugs comming up during development of the application
- **refactor** branch will have changes that have being made by another member of group on someone's work.

# Commit Message

```
<Title> - Should be in imperative format

<Description> - Brief explanation of changes have been made for this commit instance
```

**Note**: The Title and Description should be seperated by a new line.

## Commit for documentation
- For changes in documentations, use GitHub website to do it. As by doing so their is less possiblity of adding code changes into the documentation changes commits
- Only the documentation commits are directly allowed in **dev** branch. NO OTHER EXCEPTIONS!

# Merging

Any merges to **dev** and **main** branch will require a majority consensus. For other branches, it is preffered that atleast one member, other than who create the merge request, review it.

- `issue` branch will merge into respective `feat` branch
- `feat` branch will merge into `dev` branch
- `bug` and `refactor` branch depending on the situation can merge into `feat` or `dev`
- `dev` branch will merge into `main` branch
