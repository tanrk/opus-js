/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and
 * limitations under the License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * ***** END LICENSE BLOCK ***** */

// = FileSystem =
//
// This abstracts the remote Web Service file system, and in the future
// local file systems too.
//
// It ties into the {{{bespin.client.Server}}} object for remote access

dojo.provide("bespin.client.filesystem");

dojo.declare("bespin.client.FileSystem", null, {
    constructor: function(server) {
        this.server = server || bespin.get('server');
    },

    // ** {{{ bespin.client.FileSystem.newFile(project, path, callback) }}}
    //
    // Create a new file in the file system using:
    //
    // * {{{project}}} is the name of the project to create the file in
    // * {{{path}}} is the full path to save the file into
    // * {{{onSuccess}}} is a callback to fire if the file is created
    newFile: function(project, path, onSuccess, onFailure) {
        var self = this;
        this.whenFileDoesNotExist(project, path, {
            execute: function() {
                if (self.isCollaborationOn()) {
                    bespin.get('editSession').startSession(project, path || "new.txt", onSuccess, onFailure);
                } else {
                    // alert the system that a path has changed
                    bespin.publish("path:changed", {
                        project: project,
                        path: path
                    });

                    onSuccess({
                        name: path,
                        content: "",
                        timestamp: new Date().getTime()
                    });
                }
            },
            elseFailed: function() {
                if (dojo.isFunction(onFailure)) {
                    onFailure({ responseText:'The file ' + path + ' already exists my friend.' });
                }
                bespin.get("commandLine").addErrorOutput('The file ' + path + ' already exists my friend.');
            }
        });
    },

    // ** {{{ bespin.client.FileSystem.loadContents(project, path, callback) }}}
    //
    // Retrieve the contents of a file (in the given project and path) so we can
    // perform some processing on it. Called by collaborateOnFile() if
    // collaboration is turned off.
    //
    // * {{{project}}} is the name of the project that houses the file
    // * {{{path}}} is the full path to load the file into
    // * {{{onSuccess}}} is a callback to fire if the file is loaded
    loadContents: function(project, path, onSuccess, onFailure) {
        this.server.loadFile(project, path, function(content) {
            if (/\n$/.test(content)) {
                content = content.substr(0, content.length - 1);
            }

            onSuccess({
                name: path,
                content: content,
                timestamp: new Date().getTime()
            });
        }, onFailure);
    },

    /**
     * Should we attempt to use collaboration features?
     */
    isCollaborationOn: function() {
        var collab = bespin.get('settings').isSettingOn('collaborate');

        if (collab && !window.mobwrite) {
            console.log("Missing bespin.mobwrite: Forcing 'collaborate' to off in filesystem.js:collaborateOnFile");
            collab = false;
        }
        
        var capabilities = bespin.get("serverCapabilities");
        if (collab && capabilities.indexOf("collab") == -1) {
            console.log("Server doesn't support collab: Forcing 'collaborate' to off in filesystem.js:collaborateOnFile");
            collab = false;
        }

        return collab;
    },

    // ** {{{ bespin.client.FileSystem.collaborateOnFile(project, path, callback) }}}
    //
    // Load the file in the given project so we can begin editing it.
    // This loads the file contents via collaboration, so the callback will not
    // know what the
    //
    // * {{{project}}} is the name of the project that houses the file
    // * {{{path}}} is the full path to load the file into
    // * {{{onSuccess}}} is a callback to fire if the file is loaded
    collaborateOnFile: function(project, path, onSuccess, onFailure) {
        if (this.isCollaborationOn()) {
            bespin.get('editSession').startSession(project, path, onSuccess, onFailure);
        } else {
            this.loadContents(project, path, onSuccess, onFailure);
        }
    },

    // Open a file amd eval it in a given scope
    evalFile: function(project, filename, scope) {
        scope = scope || bespin.events.defaultScope();

        if (!project || !filename) {
            bespin.get('commandLine').addErrorOutput("Please, I need a project and filename to evaulate");
            return;
        }

        this.loadContents(project, filename, function(file) {
            // wow, using with. crazy.
            with (scope) {
                try {
                    eval(file.content);
                } catch (e) {
                    var html = "There is a error trying to run " + filename + " in project " + project + ":<br>" + e;
                    bespin.get('commandLine').addErrorOutput(html);
                }
            }
        }, true);
    },

    // ** {{{ FileSystem.projects(callback) }}}
    //
    // Return a JSON representation of the projects that the user has access too
    //
    // * {{{callback}}} is a callback that fires given the project list
    projects: function(callback) {
        this.server.projects(callback);
    },

    // ** {{{ bespin.client.FileSystem.fileNames(callback) }}}
    //
    // Return a JSON representation of the files at the root of the given project
    //
    // * {{{callback}}} is a callback that fires given the files
    fileNames: function(project, callback) {
        this.server.list(project, '', callback);
    },

    // ** {{{ bespin.client.FileSystem.saveFile(project, file) }}}
    //
    // Save a file to the given project
    //
    // * {{{project}}} is the name of the project to save into
    // * {{{file}}} is the file object that contains the path and content to save
    saveFile: function(project, file, onSuccess, onFailure) {
        // Unix files should always have a trailing new-line; add if not present
        if (/\n$/.test(file.content)) file.content += "\n";

        this.server.saveFile(project, file.name, file.content, file.lastOp, {
            onSuccess: function() {
                console.log("File saved: " + project + " " + file.name);
                bespin.publish("file:saved", { project: project, path: file.name });
                if (dojo.isFunction(onSuccess)) {
                    onSuccess();
                }
            },
            onFailure: onFailure
        });
    },

    // ** {{{ bespin.client.FileSystem.removeFile(project, path, onSuccess, onFailure) }}}
    //
    // Create a directory
    //
    // * {{{project}}} is the name of the directory to create
    // * {{{path}}} is the full path to the directory to create
    // * {{{onSuccess}}} is the callback to fire if the make works
    // * {{{onFailure}}} is the callback to fire if the make fails
    makeDirectory: function(project, path, onSuccess, onFailure) {
        var publishOnSuccess = function(result) {
            bespin.publish("directory:created", {
                project: project,
                path: path
            });
            onSuccess(result);
        };
        this.server.makeDirectory(project, path, publishOnSuccess, onFailure);
    },

    // ** {{{ bespin.client.FileSystem.makeDirectory(project, path, onSuccess, onFailure) }}}
    //
    // Remove a directory
    //
    // * {{{project}}} is the name of the directory to remove
    // * {{{path}}} is the full path to the directory to delete
    // * {{{onSuccess}}} is the callback to fire if the remove works
    // * {{{onFailure}}} is the callback to fire if the remove fails
    removeDirectory: function(project, path, onSuccess, onFailure) {
        var publishOnSuccess = function(result) {
            bespin.publish("directory:removed", {
                project: project,
                path: path
            });
            onSuccess(result);
        };
        this.server.removeFile(project, path, publishOnSuccess, onFailure);
    },

    // ** {{{ bespin.client.FileSystem.removeFile(project, path, onSuccess, onFailure) }}}
    //
    // Remove the file from the file system
    //
    // * {{{project}}} is the name of the project to delete the file from
    // * {{{path}}} is the full path to the file to delete
    // * {{{onSuccess}}} is the callback to fire if the remove works
    // * {{{onFailure}}} is the callback to fire if the remove fails
    removeFile: function(project, path, onSuccess, onFailure) {
        var publishOnSuccess = function(result) {
            bespin.publish("file:removed", {
                project: project,
                path: path
            });
            onSuccess(result);
        };
        this.server.removeFile(project, path, publishOnSuccess, onFailure);
    },

    // ** {{{ bespin.client.FileSystem.removeFile(project, path, onSuccess, onFailure) }}}
    //
    // Close the open session for the file
    //
    // * {{{project}}} is the name of the project to close the file from
    // * {{{path}}} is the full path to the file to close
    // * {{{callback}}} is the callback to fire when closed
    closeFile: function(project, path, callback) {
        this.server.closeFile(project, path, callback);
    },

    // ** {{{ bespin.client.FileSystem.whenFileExists(project, path, callbacks) }}}
    //
    // Check to see if the file exists and then run the appropriate callback
    //
    // * {{{project}}} is the name of the project
    // * {{{path}}} is the full path to the file
    // * {{{callbacks}}} is the pair of callbacks:
    //   execute (file exists)
    //   elseFailed (file does not exist)
    whenFileExists: function(project, path, callbacks) {
        this.server.list(project, bespin.util.path.directory(path), function(files) {
            if (files && dojo.some(files, function(file){ return (file.name == path); })) {
                callbacks['execute']();
            } else {
                if (callbacks['elseFailed']) callbacks['elseFailed']();
            }
        }, function(xhr) {
            if (callbacks['elseFailed']) callbacks['elseFailed'](xhr);
        });
    },

    // ** {{{ bespin.client.FileSystem.whenFileDoesNotExist(project, path, callbacks) }}}
    //
    // The opposite of {{{ bespin.client.FileSystem.whenFileExists() }}}
    //
    // * {{{project}}} is the name of the project
    // * {{{path}}} is the full path to the file
    // * {{{callbacks}}} is the pair of callbacks:
    //   execute (file does not exist)
    //   elseFailed (file exists)
    whenFileDoesNotExist: function(project, path, callbacks) {
        this.server.list(project, bespin.util.path.directory(path), function(files) {
            if (!files || !dojo.some(files, function(file){ return (file.name == path); })) {
                callbacks['execute']();
            } else {
                if (callbacks['elseFailed']) callbacks['elseFailed']();
            }
        }, function(xhr) {
            callbacks['execute'](); // the list failed which means it didn't exist
        });
    }
});
