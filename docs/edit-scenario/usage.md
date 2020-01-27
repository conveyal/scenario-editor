.. _managing_mods:
# Managing modifications

:term:`Modifications<modification>` can be grouped by :term:`project` and :term:`scenario`, and different projects and scenarios can be compared against each other in analysis mode, giving you flexibility on how to use them. Depending on your use cases, different approaches may make sense.

If one user will be responsible for analyses in your region, involving a relatively small number of modifications, we recommend doing your work in one project and assessing the impact of different combinations of modifications by creating and using scenarios within that project.

If multiple users will be involved in editing scenarios, or if you want to assess more than 10 different combinations of modifications, which would make the list of scenarios annoyingly long, we recommend dividing the modifications among different projects. For example, one team member could code rail scenarios in Project A, another team member could code bus scenarios in Project B. Modifications can be [imported](#importing-modifications-from-another-project) between projects that use the same :term:`GTFS bundle`; in this example, modifications from the two projects could combined in a third Project _C_.

.. _toggle_mod_display:
## Toggling display of modifications

In the list of modifications on the initial view in editing mode, clicking the title of a modification will open it and allow you to edit it. To control whether each modification is displayed on the map, click

<span class="ui-icon"><i class="fa fa-eye"></i>Toggle map display</span>

Stops and segments representing modifications are displayed on the map, using different colors to indicate their state relative to the baseline GTFS:
* Blue: Added trip pattern
* Red: Removed trip pattern
* Pink: Changed timetable (e.g. modified frequency, speed, or dwell time)
* Gray: Unchanged (alignment is unchanged but the :term:`trip pattern` is effected somehow, e.g. :ref:`reroute`)

Projects start with only a "Default" scenario (plus a locked :term:`Baseline<baseline network>` in which no modifications can be active). You can create additional scenarios expanding the list of scenarios, clicking the create button, and entering a name.

Next to each added scenario are options to:
<br><span class="ui-icon"><i class="fa fa-trash"></i>Delete</span> the scenario
<br><span class="ui-icon"><i class="fa fa-pencil"></i>Rename</span> the scenario
<br><span class="ui-icon"><i class="fa fa-eye"></i>Show on the map</span> the modifications active in the scenario

.. _export_mods:
## Exporting modifications

To see options for exporting scenarios from the top of the editing panel, click
<br><span class="ui-icon"><i class="fa fa-share-alt-square"></i>Download or share this project</span>

A panel will then be shown with multiple options to download or share the scenarios in your project:


* <span class="btn btn-info"><i class="fa fa-download"></i> Raw scenario (.json)</span> all scenario details
* <span class="btn btn-info"><i class="fa fa-download"></i> New alignments (.geojson)</span> alignments of add-trip modifications
* <span class="btn btn-info"><i class="fa fa-download"></i> New stops (.geojson)</span> new stop locations created in the scenario
* <span class="btn btn-info"><i class="fa fa-print"></i> Summary Report</span> a summary of all modifications in a scenario, for printing or reference. Keep in mind that some browsers may not print more than 30 pages or so of a long report.

<figure>
	<img src="../img/report.png" />
	<figcaption>A summary report for a scenario</figcaption>
</figure>

.. _import_mods:
## Importing modifications

To import modifications from another project or a shapefile, click
<br><span class="ui-icon"><i class="fa fa-upload"></i>Upload/import modifications</span>

### From another project

Occasionally, you may want to copy all of the modifications from one project into another. This may be useful to make a copy of a project, or to combine modifications developed by different team members into a single project (for instance, one team member working on rail changes and another on bus changes).

To do so, select a project in the upload/import panel and click
<br><span class="btn btn-success"><i class="fa fa-copy"></i> Import</span>

If you choose a project associated with the same GTFS bundle, all modifications will be imported; when there are multiple scenarios, the scenarios in the project being imported will be mapped directly to the scenarios in the receiving project (i.e. modifications in the first scenario will remain in the first scenario in the new project).

If you choose a project associated with a different GTFS, bundle, only add-trip modifications will be imported.

### From shapefiles

In general, it is best to create all modifications directly in Conveyal Analysis as it allows full control over all aspects of transit network design. However, on occasion, it may be desirable to import modifications from an [ESRI shapefile](https://en.wikipedia.org/wiki/Shapefile). If you have a shapefile containing lines, you can upload it to Conveyal Analysis and have it turned into a set of Add Trips modifications. To do so from the upload/import panel, click

<span class="btn btn-success"><i class="fa fa-upload"></i> Import</span>

Then, after selecting and importing a zipped shapefile, you will see the following:

<figure>
  <img src="../img/import-modifications-from-shapefile.png"/>
  <figcaption>Importing modifications from a shapefile</figcaption>
</figure>

There are several fields that must be filled in, corresponding to attributes (columns) in the Shapefile:
- Name of each modification (e.g. route id).
- Speed (in km/h)
- Headway (in minutes)

Finally, as Shapefiles only contain the route geometry and not the stop locations, stops can be created automatically at a specified spacing. The generated stop positions may be individually edited after import, for example to place a stop at a major transfer point.
