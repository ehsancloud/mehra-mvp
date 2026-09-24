


const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Department = require("../models/Department");
const Project = require("../models/Project");

const createDepartment = asyncHandler(async (req , res)=>{
    const department = await Department.create(req.body);
    console.log(department)
    res.status(201).json(department);
})
const getDepartments = asyncHandler(async (req, res) => {

    const departments = await Department.find();

    res.status(200).json(departments);
});


const getDepartmentNames = asyncHandler(async (req, res) => {

    const departments = await Department.find().select("name");

    res.status(200).json(
        departments.map(i => i.name)
    );
});

const updateDepartment = asyncHandler(async (req, res) => {

    const department = await Department.findByIdAndUpdate(
        req.params.id,
        {
            $set: req.body,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!department) {
        throw new ApiError(404, "Department not found!");
    }

    res.status(200).json(department);
});


const deleteDepartment = asyncHandler(async (req, res) => {

    const department = await Department.findByIdAndDelete(
        req.params.id
    );

    if (!department) {
        throw new ApiError(404, "Department not found!");
    }

    res.status(200).json({
        message: "Department deleted successfully!",
    });
});

const getDepartmentsStats = asyncHandler(async (req, res) => {
    const departments = await Department.find({})
        .select("_id name")
        .lean();
    const departmentIds = departments.map(d => d._id);

    // ------------------------------------------
    // DEPARTMENT PROJECT STATS
    // ------------------------------------------

    const projectStats = await Project.aggregate([
        {
            $match: {
                departmentId: { $in: departmentIds }
            }
        },

        {
            $group: {
                _id: "$departmentId",

                projectsCount: {
                    $sum: 1
                },

                registeredAmount: {
                    $sum: "$paidAmount"
                },

                employers: {
                    $addToSet: "$employerId"
                }
            }
        }
    ]);


    // ------------------------------------------
    // TOP EMPLOYERS
    // ------------------------------------------

    const topEmployers = await Project.aggregate([

        {
            $match: {
                departmentId: { $in: departmentIds }
            }
        },

        {
            $group: {
                _id: {
                    departmentId: "$departmentId",
                    employerId: "$employerId"
                },

                projectCount: {
                    $sum: 1
                }
            }
        },

        {
            $sort: {
                "_id.departmentId": 1,
                projectCount: -1
            }
        },

        {
            $group: {
                _id: "$_id.departmentId",

                employers: {
                    $push: {
                        employerId: "$_id.employerId",
                        projectCount: "$projectCount"
                    }
                }
            }
        },

        {
            $project: {
                employers: {
                    $slice: ["$employers", 5]
                }
            }
        },

        {
            $unwind: "$employers"
        },

        {
            $lookup: {
                from: "users",
                localField: "employers.employerId",
                foreignField: "_id",
                as: "employer"
            }
        },

        {
            $unwind: {
                path: "$employer",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $group: {
                _id: "$_id",

                employers: {
                    $push: {
                        employerId: "$employers.employerId",
                        projectCount: "$employers.projectCount",
                        firstName: "$employer.firstName",
                        lastName: "$employer.lastName",
                        username: "$employer.username"
                    }
                }
            }
        }
    ]);


    // ------------------------------------------
    // TOP FREELANCERS
    // ------------------------------------------

    const topFreelancers = await Project.aggregate([

        {
            $match: {
                departmentId: { $in: departmentIds }
            }
        },

        {
            $unwind: "$freelancersId"
        },

        {
            $group: {
                _id: {
                    departmentId: "$departmentId",
                    freelancerId: "$freelancersId"
                },

                projectCount: {
                    $sum: 1
                }
            }
        },

        {
            $sort: {
                "_id.departmentId": 1,
                projectCount: -1
            }
        },

        {
            $group: {
                _id: "$_id.departmentId",

                freelancers: {
                    $push: {
                        freelancerId: "$_id.freelancerId",
                        projectCount: "$projectCount"
                    }
                }
            }
        },

        {
            $project: {
                freelancers: {
                    $slice: ["$freelancers", 5]
                }
            }
        },

        {
            $unwind: "$freelancers"
        },

        {
            $lookup: {
                from: "users",
                localField: "freelancers.freelancerId",
                foreignField: "_id",
                as: "freelancer"
            }
        },

        {
            $unwind: {
                path: "$freelancer",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $group: {
                _id: "$_id",

                freelancers: {
                    $push: {
                        freelancerId: "$freelancers.freelancerId",
                        projectCount: "$freelancers.projectCount",
                        firstName: "$freelancer.firstName",
                        lastName: "$freelancer.lastName",
                        username: "$freelancer.username"
                    }
                }
            }
        }
    ]);


    // ------------------------------------------
    // CONVERT RESULTS TO EASY LOOKUP MAPS
    // ------------------------------------------

    const projectStatsMap = new Map(
        projectStats.map(stat => [
            stat._id.toString(),
            stat
        ])
    );

    const employersMap = new Map(
        topEmployers.map(stat => [
            stat._id.toString(),
            stat.employers
        ])
    );

    const freelancersMap = new Map(
        topFreelancers.map(stat => [
            stat._id.toString(),
            stat.freelancers
        ])
    );

    
    const result = departments.map(department => {

        const id = department._id.toString();

        const stats = projectStatsMap.get(id);

        return {
            department: {
                id: department._id,
                name: department.name
            },

            projectsCount: stats?.projectsCount || 0,

            employersCount: stats?.employers?.length || 0,

            freelancersCount:
                freelancersMap.get(id)?.length || 0,

            registeredAmount:
                stats?.registeredAmount || 0,

            topEmployers:
                employersMap.get(id) || [],

            topFreelancers:
                freelancersMap.get(id) || []
        };
    });


    res.status(200).json({
        departments: result
    });
});


const getDepartmentUserStats = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  // ------------------------------------------
  // FIND DEPARTMENT
  // ------------------------------------------

  const department = await Department.findById(departmentId)
    .select("_id name")
    .lean();

  if (!department) {
    throw new ApiError(404, "Department not found!");
  }

  // ------------------------------------------
  // FIND RELATIONSHIPS
  // ------------------------------------------

  const relationships = await Project.aggregate([
    {
      $match: {
        departmentId: department._id,
      },
    },

    // Filter projects without supervisor
    {
      $match: {
        supervisorId: { $ne: null },
      },
    },

    // One document per freelancer
    {
      $unwind: {
        path: "$freelancersId",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Group everything by supervisor
    {
      $group: {
        _id: "$supervisorId",

        employers: {
          $addToSet: "$employerId",
        },

        freelancers: {
          $addToSet: {
            $cond: [
              { $ne: ["$freelancersId", null] },
              "$freelancersId",
              "$$REMOVE"
            ]
          }
        },
      },
    },

    // ------------------------------------------
    // SUPERVISOR
    // ------------------------------------------

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "supervisor",
      },
    },

    {
      $unwind: {
        path: "$supervisor",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ------------------------------------------
    // EMPLOYERS
    // ------------------------------------------

    {
      $lookup: {
        from: "users",
        localField: "employers",
        foreignField: "_id",
        as: "employerUsers",
      },
    },

    // ------------------------------------------
    // FREELANCERS
    // ------------------------------------------

    {
      $lookup: {
        from: "users",
        localField: "freelancers",
        foreignField: "_id",
        as: "freelancerUsers",
      },
    },

    // ------------------------------------------
    // FINAL RESPONSE
    // ------------------------------------------

    {
      $project: {
        _id: 0,

        supervisorId: "$_id",

        supervisor: {
          userId: "$supervisor._id",
          firstName: "$supervisor.firstName",
          lastName: "$supervisor.lastName",
          username: "$supervisor.username",
        },

        employers: {
          $map: {
            input: "$employerUsers",
            as: "employer",
            in: {
              userId: "$$employer._id",
              firstName: "$$employer.firstName",
              lastName: "$$employer.lastName",
              username: "$$employer.username",
            },
          },
        },

        freelancers: {
          $map: {
            input: "$freelancerUsers",
            as: "freelancer",
            in: {
              userId: "$$freelancer._id",
              firstName: "$$freelancer.firstName",
              lastName: "$$freelancer.lastName",
              username: "$$freelancer.username",
            },
          },
        },
      },
    },
  ]);

  // ------------------------------------------
  // RESPONSE
  // ------------------------------------------

  res.status(200).json({
    department: {
      id: department._id,
      name: department.name,
    },

    supervisors: relationships,
  });
});


module.exports = {getDepartmentUserStats ,getDepartments , createDepartment  , getDepartmentNames , updateDepartment , deleteDepartment , getDepartmentsStats};
