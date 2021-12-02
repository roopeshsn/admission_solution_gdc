const fs = require("fs")

console.log(process.argv)

let args = process.argv.slice(2)
let command = args[0]
console.log(args)

const TASK_FILE = 'task.txt'
const COMPLETED_TASK_FILE = 'completed.txt'

switch (command) {
        case 'help':
                printHelp()
                break
        case 'add':
                addTask(args)
                break
        case 'del':
                deleteTask(args[1])
                break
        case 'report':
                report()
                break
        case 'ls':
                printPendingTasks()
                break
        case 'done':
                markTaskAsDone(args[1])
                break
        default:
                printHelp()
                break
}

function printHelp() {
        let msg = `
        $ ./task help
        Usage :-
        $ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
        $ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
        $ ./task del INDEX            # Delete the incomplete item with the given index
        $ ./task done INDEX           # Mark the incomplete item with the given index as complete
        $ ./task help                 # Show usage
        $ ./task report               # Statistics
        `
        console.log(msg)
}


function addTask(arr) {
        let priority = arr[1].trim()
        let task = arr[2].trim()
        const tasksArr = createTaskArray(TASK_FILE)

        let taskWithPriority = `${priority} ${task}`
        tasksArr.push(taskWithPriority)

        let formattedArr = tasksArr.map(task => task.split(" "));
        formattedArr.sort((a, b) => a[0] - b[0])
        
        const backToString = formattedArr.map((task) => {
                return task.join(" ")
        })

        let tasksToBeAdded = ``;
        backToString.forEach((task) => {
                tasksToBeAdded += task + '\n';
        })

        try {
                fs.writeFileSync(TASK_FILE, tasksToBeAdded.trim())
                console.log(`Added task: "${task}" with priority ${priority}`)
        } catch (error) {
                console.log(error)
        }
}

function deleteTask(idxToBeRemoved) {
        const tasks = createTaskArray(TASK_FILE)
        let formattedArray = formatTaskArray(tasks)
        const filteredArray = formattedArray.filter((task, idx) => {
                return idx+1 != idxToBeRemoved
        })
        let backToString = backToStringArray(filteredArray)
        let tasksToBeAdded = ``;
        backToString.forEach((task) => {
                tasksToBeAdded += task + '\n';
        })


        fs.writeFile(TASK_FILE, tasksToBeAdded.trim(), (error) => {
                if(error) {
                        console.log(error)
                }
        })
}

function printPendingTasks() {
        console.log(listPendingTasks())
}

function printCompletedTasks() {
        console.log(listCompletedTasks())
}

function report() {
        const pendingTaskArr = createTaskArray(TASK_FILE)
        const completedTaskArr = createTaskArray(COMPLETED_TASK_FILE)

        let pendingTasks = listPendingTasks()
        let completedTasks = listCompletedTasks()
        
        let pending = `Pending: ${pendingTaskArr.length}`
        let completed = `Completed: ${completedTaskArr.length}`

        if(pendingTaskArr.length > 0) {
                pending += '\n' + pendingTasks + '\n'
        }

        if(completedTaskArr.length > 0) {
                completed += '\n' + completedTasks + '\n'
        }
        
        console.log(pending)
        console.log(completed)
}

function createTaskArray(txtFileName) {
        const tasks = fs.readFileSync(txtFileName, 'utf8')
        if(tasks.length == 0) {
                return [];
        }
        return tasks.replace(/\r/g, "").split('\n')
}

function formatTaskArray(arr) {
        let formattedArr = arr.map(task => task.split(" "));
        return formattedArr.sort((a, b) => a[0] - b[0])
}

function backToStringArray(arr) {
        return arr.map((task) => {
                return task.join(" ")
        })
}

function listPendingTasks() {
        let tasks = createTaskArray(TASK_FILE)
        let formattedTasks = formatTaskArray(tasks)
        
        let priorityArray = formattedTasks.map(task => {
                return task[0]
        })

        let taskArray = formattedTasks.map(task => {
                return task.splice(1).join(" ")
        })

        let pendingTasks = ``

        for (let i = 0; i < taskArray.length; i++) {
                const task = taskArray[i];
                const priority = priorityArray[i]
                const taskNote = `${i+1}. ${task} [${priority}]`
                pendingTasks += taskNote + '\n' 
        }

        return pendingTasks
}

function listCompletedTasks() {
        let tasks = createTaskArray(COMPLETED_TASK_FILE)

        let completedTasks = ``

        for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const taskNote = `${i+1}. ${task}`
                completedTasks += taskNote + '\n' 
        }

        return completedTasks
}

function markTaskAsDone(idx) {
        let tasks = createTaskArray(TASK_FILE)
        console.log(tasks)
        const completedTask = tasks.find((task, index) => (index+1 == idx))
        addTaskToCompleted(completedTask)
        deleteTask(idx)
}

function addTaskToCompleted(task) {
        let existingCompletedTasks = createTaskArray(COMPLETED_TASK_FILE)
        let formattedCompletedTask = task.split(" ").splice(1).join(" ")
        existingCompletedTasks.unshift(formattedCompletedTask)
        let newCompletedTasks = ``
        existingCompletedTasks.forEach(task => newCompletedTasks += task + '\n')
        fs.writeFile(COMPLETED_TASK_FILE, newCompletedTasks.trim(), (error) => {
                if(error) {
                        console.log(error)
                }
                console.log('Marked item as done.')
        })
}
