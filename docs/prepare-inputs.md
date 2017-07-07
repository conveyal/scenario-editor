# Preparing data inputs for Scenario Editor

Scenario editor uses [GTFS](https://developers.google.com/transit/gtfs/) files as its input. These files contain information
about the existing transit service provided by an agency. Most transit agencies produce them to power customer-facing trip
planning applications, but they are also useful for analysis. A first step is to gather GTFS files for the transit agencies whose
service will be changing in your scenarios.

In order to create scenarios that will work in Transport Analyst, it is critical that all of your feeds have [`feed_id`s](https://groups.google.com/d/msg/gtfs-changes/zVjEoNIPr_Y/4ngWCajPoS0J).
Many agencies already include a `feed_id` in their `feed_info.txt` file, but if yours doesn't it is relatively easy to add. If there is already a `feed_info.txt`
file in your GTFS feed, simply extract it, add the `feed_id` column, and add the modified file back to the feed. Otherwise, create a new `feed_info.txt` like so:

    feed_id
    <feed_id>

of course replacing the second line with the `feed_id` you'd like to use, which should be a short, unique string which contains no colons. Zip this file into the feed.

Once you've gathered GTFS data, you can log into scenario editor.

First, you will select an existing project, or create one using the "create a new project" button:

<img src="../img/select-project.png" alt="selecting a project in scenario editor" />

When creating a new project, you specify a name as well as geographic bounds, which will in the future be used to fetch appropriate OpenStreetMap
and Census data. When done, click "Save Project." It is also possible to upload custom OpenStreetMap
in this view.

<img src="../img/create-project.png" alt="creating a new project in scenario editor" />

Once you have done that, you can upload your GTFS to the project. Select "Create a new Scenario." Here you can create scenarios based on the
GTFS feeds uploaded to your project. Since you have not yet uploaded any GTFS, choose "Create a bundle." You can give your bundle a name and upload your GTFS.
Note that, if you have multiple GTFS feeds, you can upload all of them at once (just make sure you have added unique feed IDs to all of them). Click "Create a bundle" to
upload your feeds. "Uploading..." will appear; it may take several minutes to upload the bundle. Once it's complete, you will be returned to the "Create a Scenario" page, where
you can select the bundle you just uploaded and give your scenario a name, and then click "Create new Scenario."

<img src="../img/create-bundle.png" alt="creating a new bundle" />

You are now ready to move on to <a href="/edit-scenario/">editing your scenario</a>
