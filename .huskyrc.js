module.exports = {
    hooks: {
        'pre-commit': 'precise-commits',
        'pre-push': 'npm run test',
        'commit-msg': 'sh Taskfile commit_msg',
    },
};
